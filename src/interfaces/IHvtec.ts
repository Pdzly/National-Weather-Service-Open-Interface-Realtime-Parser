export default interface IHvtec {
  location: string;
  severity: string;
  cause: string;
  start: Date;
  crest: Date;
  end: Date;
  record: string;
  raw_data: {
    location: string;
    s: string;
    ic: string;
    begin: string;
    crest: string;
    end: string;
    fr: string;
  };
}
