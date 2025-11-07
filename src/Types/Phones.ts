export interface Phones {
    Number: string,
    Name: string,
    id: string,
    address: string,
    updates: string,
    plan: string,
    pay: string,
    seller: string,
    date: string,
    dateOfPaid: string,
    paid: string,
    comment: string
}

export interface Instructions {
    /**
     * it changes your old excel to new extension
     */
    ConvertYourOwn(InPutPath: string, Data: Phones): void;

    /**
     * convert report from xlsx to json and assign it
     */

    Convert(InPutPath: string, Data: Phones): void;
}