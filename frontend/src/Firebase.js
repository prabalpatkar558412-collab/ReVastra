// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: "AIzaSyBWhx6C8-OSDQO_Tba0hHeyVA2Kuzfvglc",
//   authDomain: "revastra-2b192.firebaseapp.com",
//   projectId: "revastra-2b192",
//   storageBucket: "revastra-2b192.appspot.com",
//   messagingSenderId: "166732625330",
//   appId: "1:166732625330:web:69b7df52268185afef60ab",
// };

// const app = initializeApp(firebaseConfig);

// // 🔥 services
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);

// export { auth, db, storage };
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBWhx6C8-OSDQO_Tba0hHeyVA2Kuzfvglc",
  authDomain: "revastra-2b192.firebaseapp.com",
  projectId: "revastra-2b192",
  storageBucket: "revastra-2b192.appspot.com",
  messagingSenderId: "166732625330",
  appId: "1:166732625330:web:69b7df52268185afef60ab",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };