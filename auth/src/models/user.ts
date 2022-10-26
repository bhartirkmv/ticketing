import mongoose from 'mongoose';
import { Password } from '../services/password';

//Whenever we try to save a user to our database
//we are gonna implement some code inside of here 
// that is automatically going to intercept that save attempt. 


// An interface that describes the properties that 
// are required to create a new user.

interface UserAttrs {
  email: string;
  password: string
}

// An interface that describes the 
// properties the user model has

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// Interface that describes the properties that 
// a user document has.

interface UserDoc extends mongoose.Document {
  email: string,
  password: string
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required : true
  }
}, {
  // The below lines are to convert the output in the format which is desired.
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      delete ret.__v;

    }
  }
});

// This is a middleware function implemented in mongoose.
// We need to call done , once we have implemented everything 
// inside the function.

// Here we are not using the arrow function, because the context of the arrow
// function is the context of a level above it
// In this case we want to store that particular user document. 

userSchema.pre('save', async function(done){
  if(this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);




export { User };