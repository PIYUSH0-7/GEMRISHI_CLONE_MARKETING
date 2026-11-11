//--------------Add By Pawan for AbandonedCheckout------------------------
import mongoose from "mongoose";
const addressSchema=new mongoose.Schema(
    {
        postalCode:{type:String, trim:true },
        country:   {type:String, trim:true},
        state:     {type:String, trim:true},
        district:  {type:String , trim:true},
        city:      {type:String, trim:true},
        _type:     {type:String, trim:true},  // This for home/office/building etc.....
        line1:     {type:String, trim:true},
        line2:     {type:String, trim:true},
        name:      {type:String, trim:true},
        nickname:  {type:String , trim:true},
        phoneNumber:{type:String, trim:true},
        landmark:   {type:String, trim:true},
        countryPhoneCode:{type:String , trim:true},
        isDefault:       {type:Boolean, trim:false},
        sourceIdentifier:{type:String, trim:true},
        source :         {type:String, trim:true},
        addressValidationId :{type:String , trim:true}
    }, 
       { _id: false, suppressReservedKeysWarning: true }
);
 
  const gstSchema= new mongoose.Schema(
    {
        gstIn :      {type:String , trim:true},
        companyName: { type:String, trim:true},
        isActive :   { type: Boolean, trim:false},
        isVerified:  { type:Boolean},
    },
     {_id:false}
  );

  const cartItemSchema=new mongoose.Schema(
   {
    title: {type:String, trim:true, required:true},
    quantity: { type:Number, required:true},
    finalPrice:{type:Number, required:true},
    image: {type:String, trim:true},
    jewelryTitle: {type:String, trim:true},
    jewelryImage: {type:String, trim:true},
    customization: {type:mongoose.Schema.Types.Mixed},
   } ,
    {_id:false}
  );

  const abandonedCheckoutSchema= new mongoose.Schema(
    {
//------------Link back to a Registered user if we can match any on email/phone--------------
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:false,
        },
        checkoutUrl:{
            type:String,
            required:true,
            trim:true, 
        },
//--------Everything will be Saved in Rupees or INR-----------------------
        cartDetails:{
            initialPrice:{type:Number, required:true},
            totalPrice:{type:Number, required:true},
            weight:{type:Number},
            itemCount:{type:Number, required:true},
            items:{type:[cartItemSchema],default:[]},
            tax:{type:Number, required:true, default:0},
            shippingCharge:{type:Number, default:0},
            surcharge:{type:Number, default:0},
            amountPaid:{type:Number}
        },
        customer:{
            name:{type:String, trim:true},
            emailAddress:{type:String, trim:true},
            phoneNumber:{type:String,trim:true,required:true },
            shippingAddress:{type:[addressSchema], default:undefined},
            billingAddress:{type:[addressSchema] ,default:undefined},
            gst:{type:[gstSchema], required:false},
        },
        comments:{
            type:mongoose.Schema.Types.Mixed,
            required:false,
        },
        //---before_address -> only Contact number 
        //---before_Payment-> only contact and email
        //---completed -> all thing will be in order List
        paymentMethod: {
            type: String,
            trim: true,
            default: "cashfree",
        },
        paymentMode: {
            type: String,
            trim: true,
        },
        paymentStatus: {
            type: String,
            trim: true,
            default: "Pending",
        },
        paymentDetails: {
            type: mongoose.Schema.Types.Mixed,
        },
        dropOffStage: {
            type:String,
            enum:["before_address", "before_payment","completed"],
            required:true,
        },

        // payload as recieved , kept for debugging / re-processing
        rawPayload:{
            type:mongoose.Schema.Types.Mixed,
            required:false,
        },
        source:{
                 type:String,
                 define:"breeze",
        },
        // ---- Visitor IP + device (captured when the customer starts checkout) ----
        ipAddress:{ type:String, trim:true, default:"" },
        userAgent:{ type:String, trim:true, default:"" },
        deviceInfo:{
            deviceName:{ type:String, trim:true },
            deviceType:{ type:String, trim:true },
            os:        { type:String, trim:true },
            browser:   { type:String, trim:true },
        },
    // Whether an admin has actioned this (e.g. sent a recovery email/call)
         isResolved:{
            type:Boolean,
            default:false,
         },
        },
        {timestamps:true}
  );
  abandonedCheckoutSchema.index({"customer.emailAddress":1});
  abandonedCheckoutSchema.index({ "customer.phone":1 });
  abandonedCheckoutSchema.index( { createdAt: -1});
  export const AbandonedCheckout = mongoose.model("AbandoneCheckout", abandonedCheckoutSchema
  );