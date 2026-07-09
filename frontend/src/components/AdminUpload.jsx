import { useParams, NavLink } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, AlertCircle, Video, ArrowLeft, Loader2, PlayCircle } from 'lucide-react';

function AdminUpload() {
  const { problemId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors
  } = useForm();

  const selectedFile = watch('videoFile')?.[0];

  const onSubmit = async (data) => {
    const file = data.videoFile[0];
    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      const metadataResponse = await axiosClient.post('/video/save', {
        problemId: problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      reset();
    } catch (err) {
      console.error('Upload error:', err);
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 pb-20">
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NavLink to="/admin" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
              <ArrowLeft size={18} />
            </NavLink>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Video size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">Video Editorial</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 pt-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Upload Video Solution</h1>
            <p className="text-gray-400 text-sm">Provide a step-by-step video editorial for Problem ID: <br/><span className="text-blue-400 font-mono mt-1 block">{problemId}</span></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Custom File Upload Area */}
            <div className="relative group">
              <input
                type="file"
                accept="video/*"
                {...register('videoFile', {
                  required: 'Please select a video file',
                  validate: {
                    isVideo: (files) => {
                      if (!files || !files[0]) return 'Please select a video file';
                      return files[0].type.startsWith('video/') || 'Please select a valid video file';
                    },
                    fileSize: (files) => {
                      if (!files || !files[0]) return true;
                      return files[0].size <= 100 * 1024 * 1024 || 'File size must be less than 100MB';
                    }
                  }
                })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                disabled={uploading}
              />
              <div className={`w-full border-2 border-dashed ${errors.videoFile ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 group-hover:border-blue-500/50 group-hover:bg-blue-500/5'} rounded-2xl p-8 flex flex-col items-center justify-center transition-all bg-black/40`}>
                {selectedFile ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                      <PlayCircle size={32} className="text-blue-400" />
                    </div>
                    <p className="text-white font-medium text-center truncate w-full px-4">{selectedFile.name}</p>
                    <p className="text-gray-500 text-sm mt-1">{formatFileSize(selectedFile.size)}</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud size={32} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <p className="text-white font-medium mb-1">Click or drag video to upload</p>
                    <p className="text-gray-500 text-sm">MP4, WebM up to 100MB</p>
                  </>
                )}
              </div>
            </div>

            {errors.videoFile && (
              <p className="text-red-400 text-sm text-center flex items-center justify-center gap-2">
                <AlertCircle size={16} /> {errors.videoFile.message}
              </p>
            )}

            <AnimatePresence>
              {uploading && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <div className="flex justify-between text-sm text-gray-400 font-medium">
                    <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin text-blue-400" /> Uploading to Cloudinary...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </motion.div>
              )}

              {errors.root && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle size={20} className="shrink-0" />
                  <span className="text-sm">{errors.root.message}</span>
                </motion.div>
              )}

              {uploadedVideo && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-start gap-3"
                >
                  <CheckCircle2 size={24} className="shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold mb-1">Upload Successful!</h3>
                    <p className="text-sm opacity-80">Duration: {formatDuration(uploadedVideo.duration)}</p>
                    <p className="text-sm opacity-80">Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-base shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {uploading ? (
                <><Loader2 size={18} className="animate-spin" /> Processing...</>
              ) : (
                <><UploadCloud size={18} /> Upload Video</>
              )}
            </button>

          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminUpload;