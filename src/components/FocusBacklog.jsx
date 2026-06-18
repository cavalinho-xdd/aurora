import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Play, Plus, Trash2, Paperclip, Clock, CheckCircle2, X } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

function FocusBacklog({ onStartFocus }) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Modal state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(25);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, `users/${auth.currentUser.uid}/tasks`),
      where("completed", "==", false),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = [];
      snapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() });
      });
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectFile = async () => {
    if (window.api && window.api.system) {
      const file = await window.api.system.openFileDialog();
      if (file) {
        setSelectedFile(file);
      }
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !auth.currentUser) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, `users/${auth.currentUser.uid}/tasks`), {
        title: newTaskTitle,
        minutes: parseInt(newTaskMinutes, 10) || 25,
        filePath: selectedFile?.path || null,
        fileName: selectedFile?.name || null,
        completed: false,
        createdAt: serverTimestamp()
      });
      
      setNewTaskTitle('');
      setNewTaskMinutes(25);
      setSelectedFile(null);
      setShowModal(false);
    } catch (err) {
      console.error("Error adding task: ", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/tasks`, taskId));
    } catch (err) {
      console.error("Error deleting task: ", err);
    }
  };

  return (
    <div className="w-full flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{t('backlog.title')}</h2>
          <p className="text-gray-400 font-light">{t('backlog.subtitle')}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-focus-primary text-white px-5 py-2.5 rounded-full font-medium shadow-glow-primary hover:shadow-glow-primary-lg transition duration-150 ease-ui-out active:scale-95"
        >
          <Plus size={18} />
          {t('backlog.addTask')}
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 -mx-2 custom-scrollbar space-y-4 pb-10">
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-gray-500">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-gray-400">{t('backlog.noTasks')}</p>
            </motion.div>
          )}

          {tasks.map((task) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              whileHover={{ scale: 1.01 }}
              key={task.id}
              className="group relative flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-focus-primary/30 hover:bg-white/10 transition-colors duration-150 ease-ui-out active:scale-[0.98] cursor-pointer overflow-hidden shadow-lg"
              onClick={() => onStartFocus({ 
                taskId: task.id, 
                topic: task.title, 
                minutes: task.minutes, 
                filePath: task.filePath,
                hardcore: false,
                usePomodoro: false,
                pomodoroFocus: 25,
                pomodoroBreak: 5
              })}
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-focus-primary/20 flex items-center justify-center text-focus-primary shadow-inner">
                  <Play size={20} className="ml-1" fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-focus-primary transition-colors">{task.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {task.minutes} min</span>
                    {task.fileName && (
                      <span className="flex items-center gap-1.5 text-focus-primary/80 bg-focus-primary/10 px-2 py-0.5 rounded-md">
                        <Paperclip size={12} /> {task.fileName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTask(task.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors duration-150 ease-ui-out active:scale-90"
                title={t('backlog.cancel')}
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Task Modal */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowModal(false)}
              />
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-[#131122] border border-white/10 rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">{t('backlog.newTaskTitle')}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm text-gray-400 font-medium mb-2">{t('backlog.taskName')}</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 focus:border-focus-primary rounded-xl px-4 py-3 text-white focus:outline-none transition-colors"
                    placeholder="e.g. Write Essay"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 font-medium mb-2">{t('backlog.duration')}</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newTaskMinutes}
                    onChange={(e) => setNewTaskMinutes(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 focus:border-focus-primary rounded-xl px-4 py-3 text-white focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 font-medium mb-2">Attachment (Optional)</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSelectFile}
                      className="flex-1 flex items-center justify-center gap-2 border border-white/10 border-dashed rounded-xl py-3 text-gray-400 hover:text-focus-primary hover:border-focus-primary/50 transition-colors bg-white/5"
                    >
                      <Paperclip size={18} />
                      {selectedFile ? 'Change File' : 'Attach PDF/DOCX'}
                    </button>
                  </div>
                  {selectedFile && (
                    <div className="mt-3 flex items-center gap-2 bg-focus-primary/10 text-focus-primary px-3 py-2 rounded-lg text-sm font-medium">
                      <Paperclip size={14} />
                      <span className="truncate">{selectedFile.name}</span>
                      <button type="button" onClick={() => setSelectedFile(null)} className="ml-auto hover:text-white"><X size={14}/></button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                  >
                    {t('backlog.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!newTaskTitle.trim() || isSubmitting}
                    className="flex-1 py-3.5 rounded-xl bg-focus-primary hover:bg-focus-secondary text-white font-bold transition duration-150 ease-ui-out active:scale-95 shadow-glow-primary-sm disabled:opacity-50 disabled:shadow-none"
                  >
                    {t('backlog.save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default FocusBacklog;
