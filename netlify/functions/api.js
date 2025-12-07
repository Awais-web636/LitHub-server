exports.handler = async (event, context) => {
  const result = await serverless(app)(event, context);

  result.headers = {
    ...result.headers,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  };

  return result;
};
