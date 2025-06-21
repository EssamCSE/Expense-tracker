import { firestore } from "@/config/firebase";
import {
  QueryConstraint,
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";

const UseFetchData = <T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!collectionName) return;

    const collectionRef = collection(firestore, collectionName);
    const q = query(collectionRef, ...constraints);

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const fetchedData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(fetchedData);
        setLoading(false);
      },
      (err) => {
        console.log("Error fetching data: ", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { data, loading, error };
};

export default UseFetchData;
