1. new keyword: In JavaScript, the new keyword is used to create an instance of a constructor function or a class. When working with object-oriented programming in JavaScript, new is used to instantiate objects based on a constructor function.

In the context of Mongoose and defining schemas:

Mongoose Schema:

When creating a Mongoose schema, new Schema({...}) is used to create an instance of the Schema class provided by Mongoose. This instance represents the structure and validation rules for a particular collection in your MongoDB database.

2. A list of commonly used query methods and options in Mongoose:

Query Methods:

.find()
.findOne()
.findById()
.create()
.updateOne()
.updateMany()
.deleteOne()
.deleteMany()
.findByIdAndUpdate()
.findByIdAndDelete()
.findByIdAndRemove()
.countDocuments()
.distinct()
.aggregate()
Query Options:

.sort()
.limit()
.skip()
Other Query Methods:

.select()
.lean()
.exec()
These methods and options provide a range of ways to query and manipulate data in Mongoose. 
