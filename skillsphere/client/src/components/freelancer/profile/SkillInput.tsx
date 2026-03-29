import React, { useState } from 'react';
import { X, Plus, GripVertical } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

export interface Skill {
  id: string;
  name: string;
  proficiency: number;
}

interface SkillInputProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  maxSkills?: number;
}

const SkillInput: React.FC<SkillInputProps> = ({ 
  skills, 
  onChange, 
  maxSkills = 10 
}) => {
  const [newSkillName, setNewSkillName] = useState('');

  const addSkill = () => {
    if (newSkillName.trim() && skills.length < maxSkills) {
      const newSkill: Skill = {
        id: crypto.randomUUID(),
        name: newSkillName.trim(),
        proficiency: 50
      };
      onChange([...skills, newSkill]);
      setNewSkillName('');
    }
  };

  const updateSkill = (id: string, field: keyof Skill, value: string | number) => {
    onChange(skills.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const removeSkill = (id: string) => {
    onChange(skills.filter(s => s.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-4">
      {/* Add New Skill */}
      <div className="flex gap-3">
        <input
          type="text"
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a skill (e.g., React, Node.js)"
          className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all text-lg text-slate-900 placeholder:text-slate-400"
          disabled={skills.length >= maxSkills}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addSkill}
          disabled={!newSkillName.trim() || skills.length >= maxSkills}
          className="px-5 py-3 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl font-semibold transition-all flex items-center gap-2 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add</span>
        </motion.button>
      </div>
      
      {skills.length >= maxSkills && (
        <p className="text-amber-600 text-sm font-medium">
          Maximum {maxSkills} skills reached
        </p>
      )}

      {/* Skills List */}
      <Reorder.Group 
        axis="y" 
        values={skills} 
        onReorder={onChange}
        className="space-y-3"
      >
        {skills.map((skill) => (
          <Reorder.Item 
            key={skill.id} 
            value={skill}
            className="bg-slate-50 rounded-2xl p-4 border border-slate-200"
          >
            <div className="flex items-center gap-4">
              {/* Drag Handle */}
              <button className="p-2 text-slate-400 hover:text-cyan-600 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
              </button>
              
              {/* Skill Name Input */}
              <input
                type="text"
                value={skill.name}
                onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none text-lg font-medium text-slate-900"
                placeholder="Skill name"
              />
              
              {/* Proficiency Slider */}
              <div className="flex items-center gap-3 min-w-35">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skill.proficiency}
                  onChange={(e) => updateSkill(skill.id, 'proficiency', Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-slate-700 font-bold w-10 text-center text-lg">
                  {skill.proficiency}%
                </span>
              </div>
              
              {/* Remove Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeSkill(skill.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                aria-label="Remove skill"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            
            {/* Proficiency Bar Visual */}
            <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${skill.proficiency}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-linear-to-r from-cyan-400 to-blue-500 rounded-full"
              />
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      
      {skills.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-lg">No skills added yet</p>
          <p className="text-base">Add your top skills to attract relevant projects</p>
        </div>
      )}
    </div>
  );
};

export default SkillInput;