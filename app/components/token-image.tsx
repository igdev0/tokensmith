import {FormEvent, forwardRef, Ref, useImperativeHandle, useState} from 'react';

export interface TokenImageRef {
  getImage(): File;

  clear();
}

export default forwardRef(function TokenImage(props, ref: Ref<{ getImage: () => File }>,) {
  const [file, setFile] = useState<File>(null);
  const [preview, setPreview] = useState<string>();
  const handleFileChange = (event: FormEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files.item(0);
    setFile(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
  };

  useImperativeHandle(ref, (): TokenImageRef => ({
    getImage() {
      return file;
    },
    clear() {
      setFile(null);
      setPreview(null);
    }
  }));

  return (
      <>
        <div
            className="relative border-2 border-dashed text-center p-4 mt-1 flex gap-2 justify-center items-center">
          <input className="opacity-0 absolute w-full h-full cursor-pointer" type="file" onChange={handleFileChange}/>
          {file ? <img className="aspect-square w-10" src={preview}/> : null}
          {file?.name ?? "No image uploaded"}
        </div>
      </>
  );
});