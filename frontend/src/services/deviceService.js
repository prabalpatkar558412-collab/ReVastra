import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../Firebase";

export async function saveDevice(data) {
  const docRef = await addDoc(collection(db, "devices"), data);
  return docRef.id;
}

export async function getDevices() {
  const q = query(collection(db, "devices"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getDevicesByUser(uid) {
  const q = query(
    collection(db, "devices"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}