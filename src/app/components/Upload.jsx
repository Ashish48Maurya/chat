"use client";
import toast from "react-hot-toast";
import { useAuth } from "../context/context";
import { UploadDropzone } from "../utils/feature";
import slugify from 'slugify'

export default function Home() {
    const { handlePost } = useAuth();
    return (
        <main className=" lg:mx-40 sm:mx-auto md:mx-20  bg-black">
            <UploadDropzone
                appearance={{
                    container: {
                        background: "white"
                    },
                    uploadIcon: {
                        color: "black"
                    }
                }
                }
                endpoint="imageUploader"
                onClientUploadComplete={async (res) => {
                    // console.log("Files: ", res);
                    alert("Uploading File Please Wait...")
                    try {
                        const filenameWithoutExt = res[0].name.split(".")[0]
                        const filenameSlug = slugify(filenameWithoutExt, {
                            lower: true, strict: true
                        })
                        const res1 = await fetch(`/api/upload?slug=${filenameSlug}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        const data = await res1.json();
                        if (!data.success) {
                            return toast.error(data.message);
                        }
                        await handlePost(res[0].name, res[0].url, filenameSlug);
                        toast.success(data.message);
                    }
                    catch (err) {
                        toast.error(err.message)
                    }
                }}
                onUploadError={Error => {
                    alert(`ERROR! ${Error.message}`);
                }}
            />
        </main>
    );
}
