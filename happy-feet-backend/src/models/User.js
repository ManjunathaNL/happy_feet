// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const Schema = mongoose.Schema;

// const UserSchema = new Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   mobile: { type: String, required: true },
//   password: { type: String, required: true },
//   profilePhoto: { type: String, default: '' }, // URL or Base64 string for the user avatar
//   roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
//   status: { type: String, enum: ['active', 'inactive'], default: 'active' }
// }, { timestamps: true });

// // Virtual property to automatically combine first and last name for the frontend
// UserSchema.virtual('fullName').get(function() {
//   return `${this.firstName} ${this.lastName}`;
// });

// // Ensure virtuals are included when converting to JSON
// UserSchema.set('toJSON', { virtuals: true });
// UserSchema.set('toObject', { virtuals: true });

// // Password hashing middleware
// UserSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// UserSchema.methods.comparePassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.models.User || mongoose.model('User', UserSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  profilePhoto: { type: String, default: '' },
  roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
  // ✅ NEW FIELD: Linked dynamically to physical multi-outlets registry index
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', default: null }, 
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  pointsWallet: { type: Number, default: 0, min: 0 },
referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
isReferralRewardProcessed: { type: Boolean, default: false }
}, { timestamps: true });

UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);