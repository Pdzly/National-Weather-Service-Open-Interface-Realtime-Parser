export default interface IUgc {
  State: string;
  Format: string;
  Areas: string[];
  expiration: {
    day: string;
    hour: string;
    minue: string;
  };
}
