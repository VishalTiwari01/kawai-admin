import * as XLSX from 'xlsx';

export const downloadSampleExcel = () => {
  const sampleData = [
    {
      "Product Name": "Luxury Silk Saree",
      "Description": "Handcrafted silk saree with elegant designs.",
      "Short Description": "Silk Saree",
      "Category Name": "Clothing",
      "Brand": "Kawai World",
      "Is Featured": "true",
      "Is Active": "true",
      "Status": "active",
      "Tags": "silk, saree, ethnic, festive",
      "Images": "https://res.cloudinary.com/demo/image/upload/sample_product_1.jpg, https://res.cloudinary.com/demo/image/upload/sample_product_2.jpg",
      "Videos": "https://res.cloudinary.com/demo/video/upload/sample_video_1.mp4",
      "Variant Name": "Red Saree",
      "SKU": "SAREE-RED-001",
      "Price": 5000,
      "Sale Price": 4500,
      "Stock Quantity": 100,
      "Weight": 1.2,
      "Length": 600,
      "Breadth": 110,
      "Height": 1,
      "HSN": "5007",
      "Tax": 5,
      "Variant Images": "https://res.cloudinary.com/demo/image/upload/red_saree_1.jpg",
      "Variant Videos": "https://res.cloudinary.com/demo/video/upload/red_saree_promo.mp4"
    },
    {
      "Product Name": "Luxury Silk Saree",
      "Description": "Handcrafted silk saree with elegant designs.",
      "Short Description": "Silk Saree",
      "Category Name": "Clothing",
      "Brand": "Kawai World",
      "Is Featured": "true",
      "Is Active": "true",
      "Status": "active",
      "Tags": "silk, saree, ethnic, festive",
      "Images": "https://res.cloudinary.com/demo/image/upload/sample_product_1.jpg, https://res.cloudinary.com/demo/image/upload/sample_product_2.jpg",
      "Videos": "https://res.cloudinary.com/demo/video/upload/sample_video_1.mp4",
      "Variant Name": "Blue Saree",
      "SKU": "SAREE-BLUE-001",
      "Price": 5000,
      "Sale Price": 4500,
      "Stock Quantity": 80,
      "Weight": 1.2,
      "Length": 600,
      "Breadth": 110,
      "Height": 1,
      "HSN": "5007",
      "Tax": 5,
      "Variant Images": "https://res.cloudinary.com/demo/image/upload/blue_saree_1.jpg",
      "Variant Videos": ""
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  // Generate buffer and trigger download
  XLSX.writeFile(workbook, "bulk_upload_sample.xlsx");
};
