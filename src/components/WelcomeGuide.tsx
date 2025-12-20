import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Box, ShieldCheck, Zap, Globe, Rocket } from 'lucide-react';

interface WelcomeGuideProps {
    onStart: () => void;
    isVisible: boolean;
}

export const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ onStart, isVisible }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "欢迎使用 R2 Manager",
            desc: "这是您的全能 Cloudflare R2 对象存储增强管理工具，专为极致体验而生。",
            icon: <Box size={40} className="text-primary" />,
            color: "from-blue-500 to-indigo-600"
        },
        {
            title: "更安全的连接方式",
            desc: "支持自定义 Endpoint 和 CORS 防护，您的数据凭据仅存储在本地浏览器中。",
            icon: <ShieldCheck size={40} className="text-green-500" />,
            color: "from-green-500 to-teal-600"
        },
        {
            title: "极致的文件交互",
            desc: "iOS 风格的玻璃拟态设计，支持大文件分片上传、秒级预览和批量管理。",
            icon: <Zap size={40} className="text-amber-500" />,
            color: "from-amber-500 to-orange-600"
        },
        {
            title: "全球加速分发",
            desc: "完美支持自定义域名，您可以直接通过 R2 桶生成带域名的 CDN 公开链接。",
            icon: <Globe size={40} className="text-purple-500" />,
            color: "from-purple-500 to-pink-600"
        }
    ];

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#F2F2F7] dark:bg-black">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ios-glass max-w-2xl w-full rounded-[3rem] p-12 shadow-4xl relative overflow-hidden flex flex-col items-center text-center"
                >
                    {/* Background Gradient Blob */}
                    <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${steps[step].color} opacity-20 blur-[80px] rounded-full`} />
                    <div className={`absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr ${steps[step].color} opacity-10 blur-[80px] rounded-full`} />

                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col items-center gap-8 relative z-10"
                    >
                        <div className="p-8 bg-white dark:bg-zinc-800 rounded-[2rem] shadow-2xl shadow-black/5 rotate-3 hover:rotate-0 transition-transform duration-500">
                            {steps[step].icon}
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                                {steps[step].title}
                            </h2>
                            <p className="text-lg font-bold text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                                {steps[step].desc}
                            </p>
                        </div>
                    </motion.div>

                    <div className="flex gap-2 mt-12 mb-12">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 transition-all duration-500 rounded-full ${i === step ? 'w-8 bg-primary shadow-[0_0_10px_rgba(0,122,255,0.4)]' : 'w-1.5 bg-gray-300 dark:bg-zinc-800'}`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-4 w-full">
                        {step < steps.length - 1 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className="flex-1 btn-ios-primary py-5 rounded-[1.5rem] flex items-center justify-center gap-3 text-lg font-black"
                            >
                                继续探索
                                <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={onStart}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-[1.5rem] flex items-center justify-center gap-3 text-lg font-black shadow-xl shadow-blue-500/30 hover:shadow-2xl transition-all active:scale-95"
                            >
                                <Rocket size={20} />
                                立即开始配置
                            </button>
                        )}
                    </div>

                    <button
                        onClick={onStart}
                        className="mt-6 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        跳过向导
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
