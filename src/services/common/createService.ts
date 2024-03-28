import { Request } from "express";
const createService = async (req: Request, dataModel: any) => {
  const reqBody = req.body;
  try {
    const data = await dataModel.create(reqBody);
    return { status: "success", data: data };
  } catch (error) {
    return { status: "fail", data: error };
  }
};

export default createService;
