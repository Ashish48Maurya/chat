"use client";
import React, { useEffect, useState } from 'react'
import Upload from '../components/Upload'
import toast from 'react-hot-toast';
import { useAuth } from '../context/context';
import Loading from '../components/Loading';
import { Timestamp } from 'firebase/firestore';

export default function Chat() {
    const { getFile, queryFile, myFiles, handleRes, myChat, user } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('Select File To Chat');
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [isSelectedFileProcessed, setIsSelectedFileProcessed] = useState(false);
    const [ques, setQues] = useState('');
    const [chats, setChats] = useState([]);

    const formatTimestamp = (timestamp) => {
        if (timestamp instanceof Timestamp) {
            const date = timestamp.toDate();
            return date.toLocaleString();
        }
        return "";
    };

    const handleCheckboxChange = async (fileName, id, isProcessed) => {
        if (isProcessed === false) {
            toast.error("Process the File First");
            setSelectedFileId(null);
            setIsSelectedFileProcessed(false);
            return;
        }
        const chats = await myChat(id)
        setChats(chats);
        setTitle(fileName);
        setSelectedFileId(id);
        setIsSelectedFileProcessed(isProcessed);
    };


    const handleSendButtonClick = async () => {
        if (selectedFileId && isSelectedFileProcessed) {
            if (ques) {
                await QueryFile(selectedFileId, ques);
                setQues('');
            }
            else {
                toast.error("Message Req");
                return;
            }
        } else if (!isSelectedFileProcessed) {
            toast.error("Selected file is not processed");
        } else {
            toast.error("No file selected");
        }
    };

    const fetchData = async () => {
        try {
            const userId = localStorage.getItem("userId");
            const res = await myFiles(userId);
            setData(res);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFile = async (id) => {
        try {
            alert("Processing File Please Wait...")
            await getFile(id)
            await fetchData();
        }
        catch (err) {
            toast.error(err.message);
        }
    }

    const QueryFile = async (id, ques) => {
        try {
            const data = await queryFile(id, ques)
            await handleRes(id, ques, data);
            const chats = await myChat(id);
            setChats(chats);
        }
        catch (err) {
            toast.error(err.message);
        }
    }

    return (
        <>
            <div className='flex flex-col lg:flex-row gap-8 bg-black'>
                <div className="lg:w-1/2 sm:w-full sm:mx-auto ">
                    <Upload />

                    {
                        loading ? <Loading /> : <> {
                            data.length === 0 ? <h1 className=' text-orange-600 mx-auto'>Files Not Available</h1> :
                                <>
                                    <h3 className=' text-orange-600 text-center text-2xl mt-8'>Your Files</h3>
                                    <ul className="mt-4 space-y-2">
                                        {data && data.map((item, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center justify-between p-4 bg-white rounded shadow hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="mr-4"
                                                        onChange={() => handleCheckboxChange(item.fileName, item.id, item.isProcessed)}
                                                    />
                                                    <span className="text-gray-700">{item.fileName}</span>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        disabled={item.isProcessed}
                                                        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                                                        onClick={() => handleFile(item.id)}
                                                    >
                                                        {item.isProcessed ? "Processed" : "Process"}
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                        } </>
                    }
                </div>
                <div className="lg:w-1/2 sm:w-full sm:mx-auto flex flex-col h-screen">
                    <div>
                        <div class="p-4 border-b bg-blue-500 text-white text-center flex justify-between items-center">
                            <p class="text-lg font-semibold mx-auto">{title}</p>
                        </div>
                        <div id="chatbox" class="p-4 overflow-y-auto flex-1">
                            {chats && chats.length > 0 ? (
                                chats.map((item, index) => (
                                    <>
                                        <div className="chat chat-start m-1">
                                            <div className="chat-image avatar">
                                                <div className="w-10 rounded-full">
                                                    <img alt="Tailwind CSS chat bubble component" src={user?.photoURL} />
                                                </div>
                                            </div>
                                            <div className="chat-header">
                                                {user?.displayName}
                                                <time className=" text-stone-50 ml-1 text-xs opacity-50">{formatTimestamp(item.timestamp)}</time>

                                            </div>
                                            <div className="chat-bubble">{item.ques}</div>
                                            {/* <div className="chat-footer opacity-50">
                                                Delivered
                                            </div> */}
                                        </div>
                                        <div className="chat chat-end">
                                            <div className="chat-image avatar">
                                                <div className="w-10 rounded-full">
                                                    <img alt="Tailwind CSS chat bubble component" src="https://tse4.mm.bing.net/th?id=OIP.Jb1xf-J3bp_Bt9EDQWoRwAHaE8&pid=Api&P=0&h=180" />
                                                </div>
                                            </div>
                                            <div className="chat-header">
                                                ChatBot
                                                {/* <time className="text-xs opacity-50">12:45</time> */}
                                            </div>
                                            <div className="chat-bubble">{item.data}</div>
                                            {/* <div className="chat-footer opacity-50">
                                                Seen at 12:46
                                            </div> */}
                                        </div>
                                    </>
                                ))
                            ) : (
                                <p className="text-center text-gray-500">No chats available</p>
                            )}
                        </div>
                    </div>
                    <div class="p-4 border-t flex">
                        <input id="user-input" onChange={(e) => setQues(e.target.value)} type="text" placeholder="Type a message" class="w-full px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button id="send-button" class="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition duration-300" disabled={!isSelectedFileProcessed} onClick={handleSendButtonClick}>Send</button>
                    </div>
                </div>
            </div>
        </>
    )
}
