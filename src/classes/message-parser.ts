import Regexs from "../Defs/Regexs";
import PVTEC_Parser from "./pvtec-parser";
import HVTEC_Parser from "./hvtec-parser";
import UGC_Parser from "./UGC-parser";
import IPvtec from "../interfaces/IPvtec";

class MessageParser {
  // https://mesonet.agron.iastate.edu/vtec/?wfo=KBMX&phenomena=TO&significance=W&etn=20&year=2018#2019-O-NEW-KBMX-TO-W-0003/USCOMP-N0Q-201901191540
  private msg: string;
  private attrs: any;
  private PolygonCoordinates?: number[][];
  private extra_info?: { [key: string]: string };
  private vtec?: IPvtec;
  private ugc?: string;
  private ParseAndFindMultiLine(name: string, arr_value: any) {
    const extra_info: { [key: string]: string } = {};
    if (this.msg.includes(name)) {
      const beggingSub = this.msg.search(name);
      const newString = this.msg.substring(beggingSub, this.msg.length);
      const offset = this.msg.substring(0, beggingSub).length;
      let on = 0;
      let at = 0;
      newString.split("\n").find((a) => {
        at = at + a.length;
        if (a.search(".+") == -1) {
          on++;
          if (arr_value == "Actions" ? on == 2 : on == 1) {
            extra_info[arr_value] = this.msg
              .substring(beggingSub, offset + at)
              .replace(name, "")
              .replace(/\s+/g, " ");
          }
        }
      });
    }
    return extra_info;
  }

  ParseAndFindOneLine(name: string, arr_value: any) {
    const extra_info: { [key: string]: string } = {};
    if (this.msg.includes(name)) {
      const beggingSub = this.msg.search(name);
      const newString = this.msg.substring(beggingSub, this.msg.length);
      const offset = this.msg.substring(0, beggingSub).length;
      extra_info[arr_value] = this.msg
        .substring(beggingSub, offset + newString.search("\n"))
        .replace(name, "")
        .replace(/\s+/g, "");
    }
    return extra_info;
  }

  constructor(new_msg: string, new_attrs: any) {
    this.msg = decodeURI(new_msg);
    this.attrs = new_attrs;

    const pvtecCheck = this.msg.match(Regexs.PVTEC);
    const hvtecCheck = this.msg.match(Regexs.HVTEC);
    const ugcCheck = this.msg.match(Regexs.UGC);

    if (pvtecCheck && hvtecCheck && ugcCheck) {
      const vtec = new PVTEC_Parser(pvtecCheck[0]).return();
      const ugc = new UGC_Parser(ugcCheck[0]).return();

      let extra_info: { [key: string]: string } = {};

      this.ParseAndFindMultiLine("HAZARD...", "Hazard");
      this.ParseAndFindMultiLine("SOURCE...", "Source");
      this.ParseAndFindMultiLine("IMPACT...", "Impact");
      this.ParseAndFindMultiLine(
        "Locations impacted include...",
        "LocationsInclude"
      );
      this.ParseAndFindMultiLine(
        "PRECAUTIONARY/PREPAREDNESS ACTIONS...",
        "Actions"
      );

      this.ParseAndFindOneLine("HAIL...", "Hail");
      this.ParseAndFindOneLine("WIND...", "Wind");
      this.ParseAndFindOneLine("TORNADO...", "Tornado");
      this.ParseAndFindOneLine("WATERSPOUT...", "Waterspout");

      //Find Coordinates

      let PolygonCoordinates = [];
      const begin = this.msg.search("LAT...LON ");
      const end =
        this.msg.search("TIME...MOT...LOC") == -1
          ? this.msg.search("$$") - 2
          : this.msg.search("TIME...MOT...LOC") - 2;

      const parsing = this.msg
        .substring(begin, end)
        .replace("LAT...LON ", "")
        .replace(/\s+/g, " ");
      const parsing_arr = parsing.split(" ");

      for (let i = 0; i < parsing_arr.length; i = i + 2) {
        PolygonCoordinates.push([
          (-1 * parseInt(parsing_arr[i])) / 100,
          parseInt(parsing_arr[i + 1]) / 100,
        ]);
      }

      this.PolygonCoordinates = PolygonCoordinates;
      this.extra_info = extra_info;
      this.vtec = vtec;
      this.ugc = ugc;
    }

    if (hvtecCheck) {
      const hvtec = new HVTEC_Parser(hvtecCheck[0]).return();
      console.log(hvtec);
    }
  }

  getAttrs() {
    return this.attrs;
  }

  getPolygon() {
    return this.PolygonCoordinates;
  }

  getVTEC() {
    return this.vtec;
  }

  getExtras() {
    return this.extra_info;
  }

  getMessage() {
    return this.msg;
  }

  returnInfo() {
    return {
      header: this.vtec,
      polygon: this.PolygonCoordinates,
      extra_info: this.extra_info,
      ugc: this.ugc,
    };
  }
}

export default MessageParser;
