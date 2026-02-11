import React, { useEffect, useState } from "react";
import axios from "axios";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./AddAdVideos.css";

const AddAdVideos = () => {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  // Fetch videos
  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/adVideo/videos`);

      const formatted = res.data.map((v) => ({
        id: v.id,
        url: v.video_url,
        preview: `${BASE_URL}${v.video_url}`,
        existing: true,
      }));

      setVideos(formatted);
    } catch (err) {
      alert("Failed to load ad videos ❌");
      console.error(err);
    }
  };

  const handleUpload = (e) => {
  const files = Array.from(e.target.files);

  const newVideos = files.map((file) => ({
    id: URL.createObjectURL(file),
    file,
    preview: URL.createObjectURL(file),
  }));

  setVideos((prev) => [...prev, ...newVideos]);
};


  // Save to server
  const handleSubmit = async () => {
    try {
      const form = new FormData();

      videos.forEach((v) => {
        if (v.file) form.append("videos", v.file);
      });

      if (!form.has("videos")) {
        alert("No new videos to upload ℹ️");
        return;
      }

      await axios.post(`${BASE_URL}/api/adVideo/videos`, form);
      alert("Videos uploaded successfully ✅");
      fetchVideos();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed ❌");
      console.error(err);
    }
  };

  // Drag reorder
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    try {
      const oldIndex = videos.findIndex((i) => i.id === active.id);
      const newIndex = videos.findIndex((i) => i.id === over.id);
      const newArr = arrayMove(videos, oldIndex, newIndex);

      setVideos(newArr);

      const ordered = newArr
        .filter((v) => v.existing)
        .map((v) => v.url);

      await axios.put(`${BASE_URL}/api/adVideo/videos/reorder`, {
        orderedVideos: ordered,
      });

      alert("Video order updated ↕️");
    } catch (err) {
      alert("Reorder failed ❌");
      console.error(err);
    }
  };

  // Delete video
  const handleDelete = async (item) => {
    try {
      if (item.existing) {
        await axios.delete(`${BASE_URL}/api/adVideo/videos/${item.id}`);
        alert("Video deleted 🗑️");
        fetchVideos();
      } else {
        setVideos((prev) => prev.filter((v) => v.id !== item.id));
        alert("Video removed");
      }
    } catch (err) {
      alert("Delete failed ❌");
      console.error(err);
    }
  };

  const SortableItem = ({ item }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: item.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div ref={setNodeRef} style={style} className="ad-video-card">
        <div className="drag-handle" {...attributes} {...listeners}>
          ⠿ Drag
        </div>

        <video src={item.preview} controls />

        <button
          type="button"
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(item);
          }}
        >
          ✕
        </button>
      </div>
    );
  };

  return (
    <div className="ad-video-container">
      <h2>Ad Video Manager</h2>

      <input type="file" multiple accept="video/*" onChange={handleUpload} />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={videos.map((v) => v.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="ad-video-grid">
            {videos.map((v) => (
              <SortableItem key={v.id} item={v} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button className="save-btn" onClick={handleSubmit}>
        Save Videos
      </button>
    </div>
  );
};

export default AddAdVideos;
