let db = require("./index.js")({ path: "test1.db", encrypt: true, key: "secretkeyomg", noNumberOverride: true });

db.set('something.nooverride', { bread: "1" })
db.set('something.add', 1)
db.add('something.nooverride', 1)
db.add('something.add', 1)
db.add('something.b', 1)
db.push('something.array', 'nothing')
db.push('something.array', 'test')
db.pull('something.array', 'nothing')
console.log(db.get('something'))
db.delete('something.array')