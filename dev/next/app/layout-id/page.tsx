"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function DebugLayoutTransition() {
    const [leftCards, setLeftCards] = useState(["1", "2", "3", "4"]);
    const [rightCards, setRightCards] = useState(["5", "6"]);
    const [animatingCard, setAnimatingCard] = useState<string | null>(null);

    const pendingMoveRef = useRef<string | null>(null);

    useLayoutEffect(() => {
        if (pendingMoveRef.current && animatingCard) {
            const cardId = pendingMoveRef.current;

            if (leftCards.includes(cardId)) {
                // Move from left to right
                setLeftCards(prev => prev.filter(id => id !== cardId));
                setRightCards(prev => [...prev, cardId]);
            } else if (rightCards.includes(cardId)) {
                // Move from right to left
                setRightCards(prev => prev.filter(id => id !== cardId));
                setLeftCards(prev => [...prev, cardId]);
            }

            pendingMoveRef.current = null;

            // Clear animating card after animation completes
            const timeoutId = setTimeout(() => {
                setAnimatingCard(null);
            }, 500); // Adjust based on your animation duration

            return () => clearTimeout(timeoutId);
        }
    }, [animatingCard, leftCards, rightCards]);

    const moveCard = (cardId: string) => {
        pendingMoveRef.current = cardId;
        setAnimatingCard(cardId);
    };

    const renderCard = (cardId: string, isAnimating: boolean = false) => (
        <motion.div
            key={cardId}
            layoutId={cardId}
            className={`
                flex-none w-[200px] h-[200px] rounded-4xl bg-[#eee] cursor-pointer text-4xl flex items-center justify-center 
                ${isAnimating && 'fixed z-50 pointer-events-none'
                }`}
            onClick={() => !isAnimating && moveCard(cardId)}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
            }}
        >
            {cardId}
        </motion.div>
    );

    return (
        <>
            <main className="flex flex-col gap-[32px] max-w-[600px] mx-auto my-[64px] box-content">
                <div className="flex flex-col gap-[200px] justify-between w-full flex-wrap">
                    <div className={`flex flex-row w-full gap-4 border border-red-500 overflow-x-auto overscroll-contain`}>
                        {leftCards.map(cardId => renderCard(cardId))}
                    </div>

                    <div className={`flex flex-row w-full gap-4 border border-red-500 overflow-x-auto overscroll-contain`}>
                        {rightCards.map(cardId => renderCard(cardId))}
                    </div>
                </div>
            </main>

            {/* Portal for animating card */}
            {typeof window !== 'undefined' && animatingCard && createPortal(
                <AnimatePresence>
                    {renderCard(animatingCard, true)}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}