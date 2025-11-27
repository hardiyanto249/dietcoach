"use client";

import { useState, useEffect } from "react";
import { ChefHat, Clock, Flame, ArrowLeft, Utensils } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Recipe = {
    id: string;
    title: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    prepTime: number;
    cookTime: number;
    servings: number;
    category: string;
    imageUrl: string | null;
    instructions: string;
};

export default function RecipeDetailsPage() {
    const { id } = useParams();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/recipes/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setRecipe(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!recipe) {
        return <div className="p-8 text-center text-slate-500">Recipe not found</div>;
    }

    return (
        <div className="container mx-auto p-4 pb-20 max-w-3xl">
            <Link href="/recipes" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} /> Back to Recipes
            </Link>

            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="h-64 md:h-80 bg-slate-200 dark:bg-slate-700 relative">
                    {recipe.imageUrl ? (
                        <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                            <ChefHat size={64} />
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                        <h1 className="text-3xl font-bold text-white mb-2">{recipe.title}</h1>
                        <div className="flex items-center gap-4 text-white/80 text-sm">
                            <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">{recipe.category}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {recipe.prepTime + recipe.cookTime} min</span>
                            <span className="flex items-center gap-1"><Utensils size={14} /> {recipe.servings} servings</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg leading-relaxed">{recipe.description}</p>

                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Calories</div>
                            <div className="font-bold text-orange-600 dark:text-orange-400 text-lg">{recipe.calories}</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Protein</div>
                            <div className="font-bold text-blue-600 dark:text-blue-400 text-lg">{recipe.protein}g</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Carbs</div>
                            <div className="font-bold text-green-600 dark:text-green-400 text-lg">{recipe.carbs}g</div>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Fat</div>
                            <div className="font-bold text-yellow-600 dark:text-yellow-400 text-lg">{recipe.fat}g</div>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ChefHat className="text-orange-500" /> Instructions
                    </h2>

                    <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                        {recipe.instructions.split(/\d+\./).filter(Boolean).map((step, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500">
                                    {i + 1}
                                </div>
                                <p className="pt-1">{step.trim()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
