import * as Yup from "yup";

export const passwordValidation = Yup.string()
  .min(6, "Password must be at least 6 characters")
  .required("Password required");

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: passwordValidation,
});

export const registerSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  company: Yup.string().required("Company name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: passwordValidation,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  agreeTerms: Yup.boolean().oneOf(
    [true],
    "You must agree to the terms and conditions"
  ),
});

export const subCategorySchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Subcategory name must be at least 3 characters")
    .required("Subcategory name is required"),

  description: Yup.string()
    .min(5, "Description must be at least 5 characters")
    .required("Description is required"),

  type: Yup.string()
    .oneOf(["Physical", "Digital"], "Invalid type selected")
    .required("Type is required"),

  category: Yup.string().required("Category is required"),

  image: Yup.mixed()
    .required("Image is required")
    .test("fileType", "Only image files are allowed", (value) => {
      return (
        value && ["image/jpeg", "image/png", "image/jpg"].includes(value.type)
      );
    }),
});

export const categorySchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Subcategory name must be at least 3 characters")
    .required("Subcategory name is required"),
  type: Yup.string()
    .oneOf(["Physical", "Digital"], "Invalid type selected")
    .required("Type is required"),
  description: Yup.string().optional(),
  image: Yup.mixed()
    .required("Image is required")
    .test("fileType", "Only image files are allowed", (value) => {
      return (
        value && ["image/jpeg", "image/png", "image/jpg"].includes(value.type)
      );
    }),
});

export const physicalproductSchema = Yup.object().shape({
  product_name: Yup.string()
    .required("Product name is required")
    .min(3, "Product name must be at least 3 characters"),

  product_price: Yup.number()
    .typeError("Price must be a number")
    .positive("Price must be greater than zero")
    .required("Price is required"),

  product_sku: Yup.string()
    .matches(/^[A-Za-z0-9_-]+$/, "Invalid SKU format")
    .required("SKU is required"),

  product_color: Yup.string().required("Color is required"),

  product_discount: Yup.string()
    .matches(/^\d+%$/, "Invalid discount format (e.g., 10%)")
    .required("Discount is required"),

  product_meta_title: Yup.string()
    .required("Meta title is required")
    .min(5, "Meta title must be at least 5 characters"),

  product_meta_description: Yup.string()
    .required("Meta description is required")
    .min(10, "Meta description must be at least 10 characters"),

  product_tags: Yup.string().required("Tags are required"),

  product_category: Yup.string().required("Category is required"),

  product_subcategory: Yup.string().required("Subcategory is required"),

  product_status: Yup.string()
    .oneOf(["Available", "Unavailable"], "Invalid status")
    .required("Product status is required"),

  product_images: Yup.array()
    .of(
      Yup.mixed().test("fileType", "Only images are allowed", (value) => {
        if (!value || typeof value === "string") return true; // Allow existing URLs
        return value instanceof File && value.type.startsWith("image/");
      })
    )
    .min(1, "At least one image is required"),

  product_size: Yup.string().required("Product size is required"),
  product_description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Product description is required"),

  product_stockquantity: Yup.number()
    .min(1, "Quantity must be at least 1")
    .required("Quantity is required"),
});

export const digitalproductSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),

  SKU: Yup.string()
    .required("SKU is required")
    .matches(/^[A-Za-z0-9_-]+$/, "SKU must be alphanumeric"),

  category: Yup.string().required("Category is required"),

  subcategory: Yup.string().required("Subcategory is required"),

  price: Yup.number()
    .typeError("Price must be a valid number")
    .positive("Price must be greater than zero")
    .max(100000, "Price cannot exceed 100,000")
    .required("Price is required"),

  compatibility: Yup.string()
    .required("Compatibility is required")
    .min(2, "Compatibility must be at least 2 characters"),

  discount: Yup.number()
    .typeError("Discount must be a valid number")
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%")
    .required("Discount is required"),

  fileFormat: Yup.string()
    .required("File Format is required")
    .matches(/^[A-Za-z0-9.,\s]+$/, "Invalid file format"),

  fileSize: Yup.string()
    .required("File Size is required")
    .matches(
      /^\d+(\.\d+)?\s?(MB|GB|KB)$/,
      "Invalid file size format (e.g., 5 MB)"
    ),

  licenseType: Yup.string()
    .required("License Type is required")
    .min(3, "License Type must be at least 3 characters"),

  tags: Yup.string()
    .required("Tags are required")
    .matches(/^[A-Za-z0-9,.\s]+$/, "Invalid tags format"),

  version: Yup.string()
    .required("Version is required")
    .matches(/^\d+(\.\d+)*$/, "Invalid version format (e.g., 1.0.0)"),

  status: Yup.string()
    .required("Status is required")
    .oneOf(["Available", "Unavailable"], "Invalid status"),

  meta_title: Yup.string()
    .required("Meta title is required")
    .min(5, "Meta title must be at least 5 characters"),

  meta_description: Yup.string()
    .required("Meta description is required")
    .min(10, "Meta description must be at least 10 characters"),

  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
});

export const couponSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"),

  code: Yup.string()
    .trim()
    .required("Coupon code is required")
    .matches(/^[A-Z0-9]+$/, "Code must be uppercase letters or numbers")
    .min(5, "Coupon code must be at least 5 characters")
    .max(20, "Coupon code must be at most 20 characters"),

  startDate: Yup.date()
    .required("Start date is required")
    .min(new Date(), "Start date cannot be in the past"),

  endDate: Yup.date()
    .required("End date is required")
    .min(Yup.ref("startDate"), "End date must be after start date"),
  allowFreeShipping: Yup.boolean(),
  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .min(1, "Quantity must be at least 1")
    .required("Quantity is required"),
  discountType: Yup.string().required("Discount type is required"),
  discountValue: Yup.number()
    .typeError("Discount value must be a number")
    .min(1, "Discount value must be at least 1")
    .required("Discount value is required"),
  statusActive: Yup.boolean(),
  restrictionProducts: Yup.array()
    .min(1, "At least one product must be selected")
    .required("Required"),
  minSpend: Yup.number()
    .min(1, "Minimum spend must be greater than 0")
    .required("Minimum spend is required"),
  maxSpend: Yup.number()
    .min(
      Yup.ref("minSpend"),
      "Maximum spend must be greater than minimum spend"
    )
    .required("Maximum spend is required"),
  usageLimit: Yup.number()
    .typeError("Usage limit must be a number")
    .min(1, "Usage limit must be at least 1")
    .required("Usage limit is required"),
  perCustomerLimit: Yup.number()
    .typeError("Per customer limit must be a number")
    .min(1, "Per customer limit must be at least 1")
    .required("Per customer limit is required"),
});

export const mediaSchema = Yup.object().shape({
  images: Yup.array()
    .of(Yup.mixed().required("Image is required"))
    .max(5, "You can only upload up to 5 images."),
});

export const userSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First name is required")
    .min(3, "First Name must be at least 3 characters")
    .matches(/^[A-Za-z]+$/, "First name must contain only letters"),
  lastName: Yup.string()
    .required("Last name is required")
    .min(3, "Last Name must be at least 3 characters")
    .matches(/^[A-Za-z]+$/, "Last name must contain only letters"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain at least one special character"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
  allowedPermissions: Yup.array().min(
    1,
    "At least one permission must be selected."
  ),
});

export const vendorSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),

  businessType: Yup.string()
    .oneOf(["Physical", "Digital"], "Invalid Business Type")
    .required("Business Type is required"),

  email: Yup.string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),

  address: Yup.string()
    .trim()
    .required("Address is required")
    .min(5, "Address must be at least 5 characters"),

  contactNumber: Yup.string()
    .matches(/^\d{10}$/, "Contact number must be exactly 10 digits")
    .required("Contact number is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&#]/,
      "Password must contain at least one special character (@$!%*?&#)"
    )
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});
