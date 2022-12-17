import IHvtec from "../interfaces/IHvtec";

import Severity from "../Defs/severity";
import Cause from "../Defs/cause";
import Record from "../Defs/flood_record";

class HVTECParser {
  // https://www.weather.gov/media/vtec/VTEC_explanation4-18.pdf
  private hvtec?: IHvtec;
  constructor(hvtec: string) {
    const split_vtec = hvtec.split(".");
    const dates = [split_vtec[3], split_vtec[4], split_vtec[5]];
    try {
      this.hvtec = {
        location: split_vtec[0],
        severity: Severity[split_vtec[1]],
        cause: Cause[split_vtec[2]],
        start: new Date(
          new Date()
            .getFullYear()
            .toString()
            .substring(0, new Date().getFullYear().toString().length - 2) +
            dates[0].substring(0, 2) +
            "-" +
            dates[0].substring(2, 4) +
            "-" +
            dates[0].substring(4, 6) +
            "T" +
            dates[0].substring(7, 9) +
            ":" +
            dates[0].substring(9, 11) +
            ":00"
        ),
        crest: new Date(
          new Date()
            .getFullYear()
            .toString()
            .substring(0, new Date().getFullYear().toString().length - 2) +
            dates[1].substring(0, 2) +
            "-" +
            dates[1].substring(2, 4) +
            "-" +
            dates[1].substring(4, 6) +
            "T" +
            dates[1].substring(7, 9) +
            ":" +
            dates[1].substring(9, 11) +
            ":00"
        ),
        end: new Date(
          new Date()
            .getFullYear()
            .toString()
            .substring(0, new Date().getFullYear().toString().length - 2) +
            dates[2].substring(0, 2) +
            "-" +
            dates[2].substring(2, 4) +
            "-" +
            dates[2].substring(4, 6) +
            "T" +
            dates[2].substring(7, 9) +
            ":" +
            dates[2].substring(9, 11) +
            ":00"
        ),
        record: Record[split_vtec[6]],
        raw_data: {
          location: split_vtec[0],
          s: split_vtec[1],
          ic: split_vtec[2],
          begin: split_vtec[3],
          crest: split_vtec[4],
          end: split_vtec[5],
          fr: split_vtec[6],
        },
      };
    } catch (exc) {
      console.error("Something went wrong with: ");
      console.error(hvtec);
    }
  }

  return() {
    return this.hvtec;
  }
}

export default HVTECParser;
