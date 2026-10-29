import { useEffect, useState } from "react";
import { getPhoneImage } from "../utils/phoneImage";

export default function PhoneImage({ brand, model, className = "" }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    setImage(null);
    setLoading(true);

    getPhoneImage(brand, model)
      .then((url) => {
        if (active) setImage(url);
      })
      .catch(() => {
        if (active) setImage(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [brand, model]);

  if (loading) {
    return (
      <div className={className} role="status">
        Loading phone image…
      </div>
    );
  }

  if (!image) {
    return <div className={className}>Image unavailable</div>;
  }

  return (
    <img
      className={className}
      src={image}
      alt={`${brand} ${model}`}
      loading="lazy"
      onError={() => setImage(null)}
    />
  );
}
