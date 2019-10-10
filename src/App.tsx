import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect
} from "react";
import { hot } from "react-hot-loader/root";
import useFileInput from "use-file-input";
import { useHotkeys } from "react-hotkeys-hook";
import { saveAs } from "file-saver";
import sengaka from "./sengaka";

const toBlob = (
  canvas: HTMLCanvasElement,
  type?: string | undefined,
  quality?: any
) =>
  new Promise<Blob | null>(resolve => {
    canvas.toBlob(resolve, type, quality);
  });

const App: React.FC = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const fileName = useRef("");
  const canvas = useMemo(() => document.createElement("canvas"), []);
  const playing = useRef(false);
  const [jpg, setJpg] = useState(false);
  const [senga, setSenga] = useState(false);
  const [src, setSrc] = useState<string>();
  const handleInput = useFileInput(files => {
    playing.current = false;
    fileName.current = files[0].name.replace(/\..+$/, "");
    setSrc(URL.createObjectURL(files[0]));
  });
  const toggle = useCallback(() => {
    if (!ref.current) return;
    if (playing.current) {
      ref.current.pause();
    } else {
      ref.current.play();
    }
    playing.current = !playing.current;
  }, []);
  const seekFrame = useCallback((forward: boolean) => {
    if (!ref.current) return;
    ref.current.currentTime =
      ref.current.currentTime + (1 / 24) * (forward ? 1 : -1);
  }, []);
  const seekRelative = useCallback((seconds: number) => {
    if (!ref.current) return;
    ref.current.currentTime = ref.current.currentTime + seconds;
  }, []);
  const nextFrame = useCallback(() => seekFrame(true), [seekFrame]);
  const prevFrame = useCallback(() => seekFrame(false), [seekFrame]);
  const nextSecond = useCallback(() => seekRelative(1), [seekRelative]);
  const prevSecond = useCallback(() => seekRelative(-1), [seekRelative]);
  const handleCapture = useCallback(async () => {
    if (!ref.current || !src) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = ref.current.videoWidth;
    canvas.height = ref.current.videoHeight;
    ctx.drawImage(ref.current, 0, 0);

    const filename = `${fileName.current}_${Math.floor(
      ref.current.currentTime * 24
    )}`;

    const blob = await toBlob(canvas, jpg ? "image/jpeg" : "image/png", 1);
    if (!blob || !ref.current) return;
    saveAs(blob, `${filename}.${jpg ? "jpg" : "png"}`);

    if (senga) {
      sengaka(canvas);
      const blob = await toBlob(canvas, jpg ? "image/jpeg" : "image/png", 1);
      if (!blob || !ref.current) return;
      saveAs(blob, `${filename}_senga.${jpg ? "jpg" : "png"}`);
    }
  }, [canvas, jpg, senga, src]);

  useHotkeys("space", toggle, [toggle]);
  useHotkeys("o", handleInput, [handleInput]);
  useHotkeys("left", prevFrame, [prevFrame]);
  useHotkeys("right", nextFrame, [nextFrame]);
  useHotkeys("shift+left", prevSecond, [prevSecond]);
  useHotkeys("shift+right", nextSecond, [nextSecond]);
  useHotkeys("c", handleCapture, [handleCapture]);
  useHotkeys(
    "t",
    () => {
      setJpg(j => !j);
    },
    []
  );
  useHotkeys(
    "s",
    () => {
      setSenga(j => !j);
    },
    []
  );

  const [showType, setShowType] = useState(false);
  useEffect(() => {
    setShowType(true);
    setShowSenga(false);
    const timeout = window.setTimeout(() => {
      setShowType(false);
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [jpg]);
  const [showSenga, setShowSenga] = useState(false);
  useEffect(() => {
    setShowType(false);
    setShowSenga(true);
    const timeout = window.setTimeout(() => {
      setShowSenga(false);
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [senga]);

  return (
    <>
      <video
        ref={ref}
        src={src}
        onClick={e => e.currentTarget.blur()}
        onPlay={() => {
          playing.current = true;
        }}
        onPause={() => {
          playing.current = false;
        }}
        controls
        style={{
          width: "100%",
          height: "100%",
          background: "#000",
          objectFit: "contain"
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          fontSize: "48px",
          color: "#fff",
          background: "rgba(0, 0, 0, 0.5)",
          pointerEvents: "none",
          padding: "0px 10px",
          opacity: showType || showSenga ? "1" : "0"
        }}
      >
        {showSenga ? (senga ? "線画保存" : "線画無し") : jpg ? "JPG" : "PNG"}
      </div>
    </>
  );
};

export default hot(App);
