const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class JsonQuery {
  constructor(data, modelInstance) {
    this.data = data;
    this.modelInstance = modelInstance;
    this._sort = null;
    this._limit = null;
    this._skip = null;
    this._select = null;
  }

  select(fields) {
    this._select = fields;
    return this;
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  limit(limitVal) {
    this._limit = limitVal;
    return this;
  }

  skip(skipVal) {
    this._skip = skipVal;
    return this;
  }

  populate() {
    return this;
  }

  async exec() {
    let result = [...this.data];

    if (this._sort) {
      const keys = Object.keys(this._sort);
      if (keys.length > 0) {
        const sortKey = keys[0];
        const sortOrder = this._sort[sortKey] === 1 || this._sort[sortKey] === 'asc' ? 1 : -1;
        
        result.sort((a, b) => {
          let aVal = a[sortKey];
          let bVal = b[sortKey];
          if (aVal == null) return sortOrder;
          if (bVal == null) return -sortOrder;
          if (aVal < bVal) return -1 * sortOrder;
          if (aVal > bVal) return 1 * sortOrder;
          return 0;
        });
      }
    }

    if (this._skip) {
      result = result.slice(this._skip);
    }

    if (this._limit) {
      result = result.slice(0, this._limit);
    }

    if (this._select) {
      const selectFields = typeof this._select === 'string' 
        ? this._select.split(' ').filter(Boolean) 
        : Object.keys(this._select).filter(k => this._select[k]);
        
      const excludeFields = typeof this._select === 'string'
        ? selectFields.filter(f => f.startsWith('-')).map(f => f.slice(1))
        : Object.keys(this._select).filter(k => !this._select[k]);
        
      const includeFields = typeof this._select === 'string'
        ? selectFields.filter(f => !f.startsWith('-'))
        : Object.keys(this._select).filter(k => this._select[k]);
        
      result = result.map(item => {
        let projected = { ...item };
        if (includeFields.length > 0) {
          projected = { _id: item._id }; // always include _id unless explicitly excluded
          includeFields.forEach(f => projected[f] = item[f]);
        }
        excludeFields.forEach(f => delete projected[f]);
        return projected;
      });
    }

    return result.map(item => this.modelInstance._createInstance(item));
  }

  then(resolve, reject) {
    return this.exec().then(resolve).catch(reject);
  }
}

class JsonModel {
  constructor(modelName, methods = {}, statics = {}) {
    this.modelName = modelName;
    this.filePath = path.join(__dirname, `${modelName.toLowerCase()}s.json`);
    this.methods = methods;
    Object.assign(this, statics);
    // ensure file immediately so methods don't crash
    this.ensureFileExists().catch(err => console.error(err));
  }

  async ensureFileExists() {
    try {
      await fs.access(this.filePath);
    } catch {
      const dir = path.dirname(this.filePath);
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
      await fs.writeFile(this.filePath, JSON.stringify([]));
    }
  }

  async _readData() {
    await this.ensureFileExists();
    const data = await fs.readFile(this.filePath, 'utf8');
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async _writeData(data) {
    await this.ensureFileExists();
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  _createInstance(data) {
    const instance = { ...data };
    
    for (const [methodName, methodFn] of Object.entries(this.methods)) {
      instance[methodName] = methodFn.bind(instance);
    }
    
    instance.save = async () => {
      const allData = await this._readData();
      const index = allData.findIndex(item => item._id === instance._id);
      
      instance.updatedAt = new Date().toISOString();
      
      if (index !== -1) {
        const plainData = { ...instance };
        for (const key in plainData) {
          if (typeof plainData[key] === 'function') delete plainData[key];
        }
        allData[index] = plainData;
        await this._writeData(allData);
      } else {
        await this.create(instance);
      }
      return instance;
    };

    instance.populate = function() { return this; };

    return instance;
  }

  _matchQuery(item, query) {
    if (!query || Object.keys(query).length === 0) return true;
    
    for (const key of Object.keys(query)) {
      const queryVal = query[key];
      
      if (key === '$or' && Array.isArray(queryVal)) {
        let orMatch = false;
        for (const subQuery of queryVal) {
          if (this._matchQuery(item, subQuery)) {
            orMatch = true;
            break;
          }
        }
        if (!orMatch) return false;
      } else if (typeof queryVal === 'object' && queryVal !== null && !(queryVal instanceof Date)) {
        if (queryVal.$in) {
          if (!queryVal.$in.includes(item[key])) return false;
        } else if (queryVal.$ne) {
          if (item[key] === queryVal.$ne) return false;
        } else if (queryVal.$regex) {
          const regex = new RegExp(queryVal.$regex, queryVal.$options || 'i');
          if (!regex.test(item[key])) return false;
        }
      } else {
        if (item[key] !== queryVal) return false;
      }
    }
    return true;
  }

  find(query = {}) {
    const promiseLike = {
      then: (resolve, reject) => {
        return this._readData().then(data => {
          const filtered = data.filter(item => this._matchQuery(item, query));
          return new JsonQuery(filtered, this).exec();
        }).then(resolve).catch(reject);
      },
      sort: (sortObj) => {
        const jq = new JsonQuery([], this);
        jq.sort(sortObj);
        jq.exec = async () => {
          const data = await this._readData();
          const filtered = data.filter(item => this._matchQuery(item, query));
          jq.data = filtered;
          return JsonQuery.prototype.exec.call(jq);
        };
        return jq;
      },
      limit: (limitVal) => {
         const jq = new JsonQuery([], this);
         jq.limit(limitVal);
         jq.exec = async () => {
           const data = await this._readData();
           const filtered = data.filter(item => this._matchQuery(item, query));
           jq.data = filtered;
           return JsonQuery.prototype.exec.call(jq);
         };
         return jq;
      }
    };
    
    promiseLike.populate = () => promiseLike;

    return promiseLike;
  }

  async findOne(query) {
    const data = await this._readData();
    const item = data.find(item => this._matchQuery(item, query));
    if (item) {
       return this._createInstance(item);
    }
    return null;
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async create(data) {
    const allData = await this._readData();
    const _id = crypto.randomBytes(12).toString('hex');
    const newItem = {
      ...data,
      _id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    allData.push(newItem);
    await this._writeData(allData);
    return this._createInstance(newItem);
  }

  async insertMany(dataArray) {
    const allData = await this._readData();
    const newItems = dataArray.map(data => ({
      ...data,
      _id: crypto.randomBytes(12).toString('hex'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    allData.push(...newItems);
    await this._writeData(allData);
    return newItems.map(item => this._createInstance(item));
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const allData = await this._readData();
    const index = allData.findIndex(item => item._id === id);
    if (index === -1) return null;
    let updatedItem = { ...allData[index] };
    if (updateData.$set) {
       updatedItem = { ...updatedItem, ...updateData.$set };
    } else {
       updatedItem = { ...updatedItem, ...updateData };
    }
    updatedItem.updatedAt = new Date().toISOString();
    allData[index] = updatedItem;
    await this._writeData(allData);
    return this._createInstance(updatedItem);
  }

  async updateMany(query, updateData) {
    const allData = await this._readData();
    let modifiedCount = 0;
    
    allData.forEach((item, index) => {
      if (this._matchQuery(item, query)) {
        let updatedItem = { ...item };
        if (updateData.$set) {
           updatedItem = { ...updatedItem, ...updateData.$set };
        } else {
           updatedItem = { ...updatedItem, ...updateData };
        }
        updatedItem.updatedAt = new Date().toISOString();
        allData[index] = updatedItem;
        modifiedCount++;
      }
    });
    
    if (modifiedCount > 0) {
      await this._writeData(allData);
    }
    
    return { modifiedCount };
  }

  async findByIdAndDelete(id) {
    const allData = await this._readData();
    const index = allData.findIndex(item => item._id === id);
    if (index === -1) return null;
    const deletedItem = allData[index];
    allData.splice(index, 1);
    await this._writeData(allData);
    return deletedItem;
  }

  async deleteMany(query = {}) {
    const allData = await this._readData();
    const initialLength = allData.length;
    const remainingData = allData.filter(item => !this._matchQuery(item, query));
    await this._writeData(remainingData);
    return { deletedCount: initialLength - remainingData.length };
  }

  async countDocuments(query = {}) {
    const data = await this._readData();
    const filtered = data.filter(item => this._matchQuery(item, query));
    return filtered.length;
  }

  async aggregate(pipeline) {
    let data = await this._readData();
    
    for (const stage of pipeline) {
      if (stage.$match) {
        data = data.filter(item => this._matchQuery(item, stage.$match));
      } else if (stage.$group) {
        const grouped = {};
        const _idField = stage.$group._id ? stage.$group._id.replace('$', '') : null;
        
        data.forEach(item => {
          const key = _idField ? item[_idField] : 'all';
          if (!grouped[key]) {
            grouped[key] = { _id: key };
            for (const [k, v] of Object.entries(stage.$group)) {
              if (k !== '_id' && v.$sum === 1) {
                grouped[key][k] = 0;
              }
            }
          }
          
          for (const [k, v] of Object.entries(stage.$group)) {
            if (k !== '_id' && v.$sum === 1) {
              grouped[key][k]++;
            }
          }
        });
        
        data = Object.values(grouped);
      }
    }
    return data;
  }
}

module.exports = JsonModel;
