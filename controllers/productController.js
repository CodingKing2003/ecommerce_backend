const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Product = require("../models/productModel");

const ErrorHandler = require("../utils/errorhandler");
const ApiFeatures = require("../utils/apiFeatures");



// Create Product -- Admin

exports.createProduct = catchAsyncErrors(async (req, res, next) => {

  req.body.user = req.user.id;
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

// get all products
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 2;
  const productCount=await Product.countDocuments();
  const apiFeature=new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultPerPage);
  let products=await apiFeature.query;

  
  
  res.status(200).json({
    success: true,
    products,
    productCount,
  });
});

// Update Product -- Admin

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(500).json({
      success: false,
      message: "Product not found",
    });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// Get product Details

exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
   return next(new ErrorHandler("Product Not Found",404))
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product-- Admin

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(500).json({
      success: false,
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});


// review 

exports.createProductReview=catchAsyncErrors(async(req,res,next)=>{
  const {rating,comment,productId}=req.body;

  const review={
    user:req.user.id,
    name:req.user.name,
    rating:Number(rating),
    comment,
  }

  const product=await Product.findById(productId);

  const isReviewed=product.reviews.find(
    (rev)=>rev.user.toString()==req.user._id.toString() );
 

  if(isReviewed){
    product.reviews.forEach((rev)=>{
      if(rev.user.toString()==req.user._id.toString()){
        rev.rating=rating,
        rev.comment=comment
      }
    })

  }else{
    product.reviews.push(review);
    product.numOfReviews=product.reviews.length;
  }

  let avg=0;
  product.reviews.forEach((rev)=>avg+=rev.rating);

  product.rating=avg/product.reviews.length;

  await product.save({validateBeforeSave: false});

  res.status(200).json({
    success:true
  })


})

// get all reviews of a product

exports.getProductReviews=catchAsyncErrors(async(req,res,next)=>{
  const product=await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });

})


// delete review

exports.deleteReview=catchAsyncErrors(async(req,res,next)=>{

  const product=await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews=product.reviews.filter((rev)=>rev._id.toString() !== req.query.id.toString());

   let avg=0;
   reviews.forEach((rev) => {
    avg += rev.rating;
  });

  const rating=avg/reviews.length;

  const numOfReviews=reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      rating,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );




  res.status(200).json({
    success: true,
   
  });



})

