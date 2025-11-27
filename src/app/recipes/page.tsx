"use client";

import { useState, useEffect } from "react";
import { ChefHat, Clock, Flame, ArrowRight } from "lucide-react";
import Link from "next/link";

type Recipe = {
    id: string;
    title: string;
    description: string;
    calories: number;
    prepTime: number;
    cookTime: number;
    category: string;
    imageUrl: string | null;
};

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/recipes")
            .then((res) => res.json())
            .then((data) => {
                setRecipes(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="container mx-auto p-4 pb-20">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <ChefHat className="text-orange-500" /> Healthy Recipes
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Delicious local recipes under 500 calories.</p>
            </header>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {recipes.map((recipe) => (
                        <div key={recipe.id} className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group">
                            <div className="h-48 bg-slate-200 dark:bg-slate-700 relative">
                                {/* Placeholder for image if null */}
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                    <ChefHat size={48} />
                                </div>
                                {recipe.imageUrl && (
                                    <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                    <Flame size={12} className="text-orange-400" /> {recipe.calories} kcal
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold group-hover:text-orange-500 transition-colors">{recipe.title}</h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">{recipe.description}</p>

                                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} />
                                        <span>{recipe.prepTime + recipe.cookTime} min</span>
                                    </div>
                                    <div className="uppercase tracking-wider font-semibold text-orange-500">
                                        {recipe.category}
                                    </div>
                                </div>

                                <Link href={`/recipes/${recipe.id}`} className="w-full py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 hover:bg-orange-200 dark:hover:bg-orange-900/50">
                                    View Recipe <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
