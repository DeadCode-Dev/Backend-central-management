import XLSX from "xlsx";
import { Instructions, Phones } from "../../Types/Phones";
import User from "../../Schemas/Users";
class Utils implements Instructions {
  async ConvertYourOwn(InPutPath: string, Data: Phones) {
    const workbook = XLSX.readFile(InPutPath);

    const sheetName: string = workbook.SheetNames[0];
    const jsonData: any[] = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName]
    );
    jsonData.forEach(async (item: { [key: string]: any }) => {
      let Users = await User.findOne({
        Number: item[Data.Number],
        id: item[Data.id],
        name: item[Data.Name],
      });
      if (!Users) {
        new User({
          Number: item[Data.Number],
          id: item[Data.id],
          address: item[Data.address],
          updates: item[Data.updates],
          plan: item[Data.plan],
          seller: item[Data.seller],
          date: `${String(item[Data.date]) || ""}`,
          pay: item[Data.pay],
          dateOfPaid: `${String(item[Data.dateOfPaid]) || ""}`,
          paid: item[Data.paid],
          comment: item[Data.comment],
          name: item[Data.Name],
        }).save();
      }
    });
  }

  async Convert(InPutPath: string, Data: Phones) {
    const workbook = XLSX.readFile(InPutPath);

    const sheetName: string = workbook.SheetNames[0];
    const jsonData: any[] = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName]
    );
    jsonData.forEach(async item => {
      let Users = await this.SearchBy("Number", item[Data.Number]);
      Users.forEach(User => {
        User.paid = item[Data.paid];
        User.save();
      })
    })
  }

  async SearchBy(key: keyof Phones, CODE: string) {
    let Users = await User.find({ [key]: CODE });
    return Users;
  }
}

export default Utils;
