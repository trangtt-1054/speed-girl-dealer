import { CarModel } from "../../api/Car";

export interface CarCardProps {
  car: CarModel;
}
export const CarCard = ({ car }: CarCardProps) => {
  return <div>{JSON.stringify(car)}</div>;
};
