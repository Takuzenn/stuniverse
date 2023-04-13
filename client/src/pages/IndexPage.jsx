import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Image from "../Image.jsx";

export default function IndexPage() {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/places').then(response => {
      setPlaces(response.data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="mt-8">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {places.map(place => (
            <Link to={`/place/${place._id}`} key={place._id}>
              <div className="bg-gray-500 mb-2 rounded-2xl flex">
                {place.photos?.[0] && (
                  <Image className="rounded-2xl object-cover aspect-square" src={place.photos?.[0]} alt=""/>
                )}
              </div>
              <div className="">
                <h2 className="font-bold text-white">{place.address}</h2>
                <h3 className="text-sm text-white">{place.title.length > 25 ? place.title.slice(0, 25) + "..." : place.title}</h3>
                <div className="mt-1">
                  <span className="font-bold text-white">${place.price}</span> per night
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
