export default interface IPvtec {
    class: string,
    action: string,
    office: string,
    phenomena: string,
    significance: string,
    event_tracking_number: string,
    start:Date,
    end: Date,
    raw_data: {
        class: string,
        action: string,
        office: string,
        phenomena: string,
        significance: string,
        event_tracking_number: string,
        phenomstartena: string,
        end: string,
    }
  }
  