const crypto = require('crypto');
const fs = require("node:fs")
const _ = require("lodash");
const chalk = require("chalk");

function encrypt(key, string) {
  var cipher = crypto.createCipher('aes-256-cbc', key);
  var encrypted = cipher.update(string, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(key, string, iv) {
  var decipher = crypto.createDecipher('aes-256-cbc', key);
  var decrypted = decipher.update(string, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = function(obj) {
  let ekey = obj.key;
  let e = obj.encrypt;
  let path = obj.path || 'atom.db';
  let data = {};
  let nno = obj.noNumberOverride || false;
  if(!fs.existsSync(path)) {
    fs.writeFileSync(path, '{}');
  } else {
    data = JSON.parse(fs.readFileSync(path)) || {};
  }
  if(!ekey && e == true) {
    console.log(chalk.red('Please, enter an encryption key, make sure it\'s a secret tho (we recommend you store it in a safe place though.)'));
    ekey = 'default';
  }
  return {
    get: function(key) {
      if(key.includes('.')) {
        let keyParts = key.split('.');
        let val = data;
        for(let i = 0; i < keyParts.length; i++) {
          val = val[keyParts[i]];
        }
        if(e == true) {
          if(typeof val ==='string') {
            return decrypt(ekey, val)
          } else {
            return val;
          }
        } else {
          return val;
        }
      } else {
        if(e == true) {
          if(typeof data[key] ==='string') {
            return decrypt(ekey, data[key])
          } else {
            return data[key];
          }
        } else {
          return data[key];
        }
      }
    },
    set: function(key, value) {
      if(key.includes('.')) {
        let val = value;
        if(e == true) {
          if(typeof value === 'string') {
            val = encrypt(ekey, value);
          } else {
            val = value
          }
        } else {
          val = value
        }
        _.set(data, key, val);
        fs.writeFileSync(path, JSON.stringify(data));
      } else {
        if(e == true) {
          if(typeof value ==='string') {
            data[key] = encrypt(ekey, value);
          } else {
            data[key] = value;
          }
        } else {
          data[key] = value;
        }
        fs.writeFileSync(path, JSON.stringify(data));
      }
    },
    add: function(key, value) {
      if(!nno || (nno && (typeof this.get(key) === 'number') || (typeof this.get(key) === 'string'))) {
        let num = (((this.get(key) && !isNaN(Number(this.get(key)))) ? Number(this.get(key)) : 0) + ((value && !isNaN(Number(value)))? Number(value) : 0));
        let finalval = (e == true) ? encrypt(ekey, '' + num) : num;
        if(key.includes('.')) {
          _.set(data, key, finalval)
          fs.writeFileSync(path, JSON.stringify(data));
        } else {
          data[key] = finalval;
        }
      }
    },
    subtract: function(key, value) {
      if(!nno || (nno && (typeof this.get(key) === 'number') || (typeof this.get(key) === 'string'))) {
        let num = (((this.get(key) && !isNaN(Number(this.get(key)))) ? Number(this.get(key)) : 0) - ((value && !isNaN(Number(value)))? Number(value) : 0));
        let finalval = (e == true) ? encrypt(ekey, '' + num) : num;
        if(key.includes('.')) {
          _.set(data, key, finalval)
          fs.writeFileSync(path, JSON.stringify(data));
        } else {
          data[key] = finalval;
        }
      }
    },
    push: function(key, value) {
      let arr = (this.get(key)) ? this.get(key) : [];
      arr.push((e == true) ? encrypt(ekey, value) : value);
      this.set(key, arr);
      fs.writeFileSync(path, JSON.stringify(data));
    },
    pull: function(key, value) {
      let arr = this.get(key) || [];
      let index = arr.indexOf((e == true) ? encrypt(ekey, value) : value);
      if(index > -1) {
        arr.splice(index, 1);
      }
      this.set(key, arr);
      fs.writeFileSync(path, JSON.stringify(data));
    },
    delete: function(key) {
      if(key.includes('.')) {
        _.unset(data, key);
        fs.writeFileSync(path, JSON.stringify(data));
      } else {
        delete data[key];
        fs.writeFileSync(path, JSON.stringify(data));
      }
    },
    decrypt: function(key, val) {
      if(!val) {
        return decrypt(ekey, key);
      } else {
        return decrypt(key, val);
      }
    },
    encrypt: function(key, val) {
      if(!val) {
        return encrypt(ekey, key);
      } else {
        return encrypt(key, val);
      }
    }
  }
}