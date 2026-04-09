// import {
//   addDoc,
//   collection,
//   getDocs,
//   query,
//   orderBy,
//   where,
// } from "firebase/firestore";
// import { db } from "../Firebase";

// export async function saveDevice(data) {
//   const docRef = await addDoc(collection(db, "devices"), data);
//   return docRef.id;
// }

// export async function getDevices() {
//   const q = query(collection(db, "devices"), orderBy("createdAt", "desc"));
//   const snapshot = await getDocs(q);

//   return snapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   }));
// }

// export async function getDevicesByUser(uid) {
//   const q = query(
//     collection(db, "devices"),
//     where("uid", "==", uid),
//     orderBy("createdAt", "desc")
//   );

//   const snapshot = await getDocs(q);

//   return snapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   }));
// }

import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../Firebase";

export async function uploadDeviceImage(file, uid) {
  if (!file) return "";

  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const imageRef = ref(storage, `devices/${uid}/${fileName}`);

  await uploadBytes(imageRef, file);
  const downloadURL = await getDownloadURL(imageRef);

  return downloadURL;
}

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