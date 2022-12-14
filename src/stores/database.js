import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore/lite";
import { nanoid } from "nanoid";
import { defineStore } from "pinia";
import { auth, db } from "../firebaseConfig";
import { router } from "../router";

export const useDatabaseStore = defineStore("database", {
    state: () => ({
        documents: [],
        loading: false,
        loadingDoc: false,
    }),
    actions: {
        async getUrl(id) {
            try {
                const docRef = doc(db, "urls", id);

                const docu = await getDoc(docRef);

                if (!docu.exists()) {
                    return false;
                }

                return docu.data().name;
            } catch (e) {
                console.log(e.message);
                return false;
            }
        },
        async getUrls() {
            if (this.documents.length !== 0) {
                return;
            }

            this.loadingDoc = true;

            try {
                const q = query(
                    collection(db, "urls"),
                    where("user", "==", auth.currentUser.uid)
                );

                const querySnapshot = await getDocs(q);

                querySnapshot.forEach((doc) => {
                    console.log(doc.id, doc.data);
                    this.documents.push({
                        id: doc.id,
                        ...doc.data(),
                    });
                });
            } catch (e) {
                console.log(e);
            } finally {
                this.loadingDoc = false;
            }
        },
        async readUrl(id) {
            try {
                const docRef = doc(db, "urls", id);

                const docu = await getDoc(docRef);

                if (!docu.exists()) {
                    throw new Error("No existe el documento");
                }

                if (docu.data().user !== auth.currentUser.uid) {
                    throw new Error("No le pertenece el documento");
                }

                return docu.data().name;
            } catch (e) {
                console.log(e.message);
            }
        },
        async addUrl(name) {
            this.loading = true;
            try {
                const objetoDoc = {
                    name: name,
                    short: nanoid(6),
                    user: auth.currentUser.uid,
                };

                await setDoc(doc(db, "urls", objetoDoc.short), objetoDoc);

                this.documents.push({
                    id: objetoDoc.short,
                    ...objetoDoc,
                });
            } catch (e) {
                console.log(e);
                return e.code;
            } finally {
                this.loading = false;
            }
        },
        async updateUrl(id, name) {
            this.loading = true;
            try {
                const docRef = doc(db, "urls", id);

                const docu = await getDoc(docRef);

                if (!docu.exists()) {
                    throw new Error("No existe el documento");
                }

                if (docu.data().user !== auth.currentUser.uid) {
                    throw new Error("No le pertenece el documento");
                }
                await updateDoc(docRef, {
                    name: name,
                });

                this.documents = this.documents.map((item) =>
                    item.id === id ? { ...item, name: name } : item
                );

                router.push("/");
            } catch (e) {
                console.log(e.message);
                return e.code;
            } finally {
                this.loading = false;
            }
        },
        async deleteUrl(id) {
            this.loading = true;
            try {
                const docRef = doc(db, "urls", id);

                const docu = await getDoc(docRef);

                if (!docu.exists()) {
                    throw new Error("No existe el documento");
                }

                if (docu.data().user !== auth.currentUser.uid) {
                    throw new Error("No le pertenece el documento");
                }

                await deleteDoc(docRef);

                this.documents = this.documents.filter(
                    (item) => item.id !== id
                );
            } catch (e) {
                console.log(e.message);
                return e.code;
            } finally {
                this.loading = false;
            }
        },
    },
});
