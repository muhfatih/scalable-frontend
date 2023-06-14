"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

enum Popup {
  none,
  add,
  edit,
  success,
}

const env = process.env.NEXT_PUBLIC_URL;

interface TypeImage {
  id: string;
  filename: string;
  path: string;
  created_at: string;
}
export default function Home() {
  const [popup, setPopUp] = useState<Popup>(Popup.none),
    [edit, setEdit] = useState(""),
    [images, setImages] = useState<TypeImage[]>([]);

  useEffect(() => {
    axios.get(`${env}/images`).then((res) => {
      setImages(res.data);
    });
  }, []);

  const style_card =
    "aspect-square rounded-xl bg-neutral-900 hover:bg-neutral-800 p-4";
  return (
    <>
      <main className="py-24 px-6 min-h-screen max-w-screen-2xl mx-auto">
        <h1 className="mb-24 text-3xl font-bold">Image Resizer</h1>
        <ul className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          <li
            className={`${style_card} border border-dashed border-spacing-6 border-opacity-50 border-white`}
          >
            <button
              className="w-full h-full flex flex-col justify-center items-center"
              onClick={() => {
                setPopUp(Popup.add);
              }}
            >
              +
            </button>
          </li>
          {images.map((obj: any) => (
            <li key={obj.id} className={style_card}>
              <button
                className="w-full h-full flex flex-col justify-center items-center"
                onClick={() => {
                  setPopUp(Popup.edit);
                  setEdit(obj);
                }}
              >
                <img className="object-contain w-full h-full" src={obj.path} alt="" />
              </button>
            </li>
          ))}
        </ul>

        {popup === Popup.edit && (
          <EditPopUp
            object={edit}
            close={() => {
              setPopUp(Popup.none);
            }}
          />
        )}
        {popup === Popup.add && (
          <AddPopUp
            close={() => {
              setPopUp(Popup.none);
            }}
            setPopup={setPopUp}
          />
        )}
        {popup === Popup.success && (
          <SuccessPopUp
            close={() => {
              setPopUp(Popup.none);
            }}
          />
        )}
      </main>
    </>
  );
}

interface PropsEdit {
  object?: any;
  close: any;
  setPopup?: any;
}

const EditPopUp = (props: PropsEdit) => {
  const style_form = "bg-neutral-700 rounded w-24 mb-4",
    [size, setSize] = useState({
      width: 0,
      height: 0,
    }),
    [newImg, setNewImg] = useState<string>("");

  const handleChange = (e: any) => [
    setSize({ ...size, [e.target.name]: Number(e.target.value) }),
  ];

  const handleSubmit = (e: any) => {
    e.preventDefault();
    axios
      .get(
        `${env}/resize/${props.object.filename}?width=${size.width}&height=${size.height}`
      )
      .then((res) => {
        setNewImg(res.data.path);
      });
  };

  return (
    <div
      className="bg-black bg-opacity-20 fixed top-0 left-0 h-screen w-screen flex justify-center items-center"
      onClick={() => {
        props.close();
      }}
    >
      <div
        className="bg-neutral-800 px-6 py-8 rounded-xl max-w-screen-xl grid grid-cols-3"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <img src={props.object.path} alt="" />
        <form className="p-4 w-full h-full bg-inherit" onSubmit={handleSubmit}>
          <div className="w-min mx-auto">
            <label htmlFor="width">Width:</label>
            <br />
            <input
              type="number"
              name="width"
              className={style_form}
              onChange={handleChange}
              value={size.width}
            />
          </div>
          <div className="w-min mx-auto">
            <label htmlFor="height">Height:</label>
            <br />
            <input
              type="number"
              name="height"
              className={style_form}
              onChange={handleChange}
              value={size.height}
            />
          </div>
          <button
            type="submit"
            className="bg-neutral-600 py-1 px-4 rounded w-full"
          >
            Resize
          </button>
        </form>
        {newImg === "" ? <div>Waiting Image</div> : <img src={newImg} alt="" />}
      </div>
    </div>
  );
};

const AddPopUp = (props: PropsEdit) => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [],
      "image/jpg": [],
      "image/png": [],
      "image/webp": [],
    },
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    let formData = new FormData();
    formData.append("image", acceptedFiles[0]);

    axios
      .post(`${env}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        props.setPopup(Popup.success);
      });
  };

  return (
    <div
      className="bg-black bg-opacity-20 fixed top-0 left-0 h-screen w-screen flex justify-center items-center"
      onClick={props.close}
    >
      <form
        className="bg-neutral-800 px-6 py-8 rounded-xl max-w-screen-xl"
        onClick={(e) => {
          e.stopPropagation();
        }}
        onSubmit={handleSubmit}
      >
        {acceptedFiles.length > 0 ? (
          <div className="grid gap-6">
            <img
              src={URL.createObjectURL(acceptedFiles[0])}
              alt="uploaded image"
            />
            <button className="bg-neutral-600 py-3 rounded">Submit</button>
          </div>
        ) : (
          <div
            {...getRootProps({ className: "dropzone" })}
            className="p-5 cursor-pointer border border-dashed rounded"
          >
            <input {...getInputProps()} />
            <p>Drag 'n' drop some files here, or click to select files</p>
          </div>
        )}
      </form>
    </div>
  );
};

const SuccessPopUp = (props: PropsEdit) => {
  return (
    <div
      className="bg-black bg-opacity-20 fixed top-0 left-0 h-screen w-screen flex justify-center items-center"
      onClick={() => {
        props.close();
      }}
    >
      <div
        className="bg-neutral-800 px-6 py-8 rounded-xl max-w-screen-xl"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        Image Uploaded
      </div>
    </div>
  );
};
