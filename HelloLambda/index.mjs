export const handler = async (event, context, callback) => {
    // Mở Cloudwatch log lên để kiểm tra log
    console.log("Xuat log vao cloudwatch");

    return "Hello Word";
};
