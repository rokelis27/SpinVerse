'use client';

import { useState } from 'react';
import { useBuilderStore } from '@/stores/builderStore';
import { SequenceStepBuilder, WheelSegmentBuilder } from '@/types/builder';
import { BranchEditor } from './BranchEditor';

interface StepEditorProps {
  step: SequenceStepBuilder;
  stepIndex: number;
}

export const StepEditor: React.FC<StepEditorProps> = ({ step, stepIndex }) => {
  const {
    updateStep,
    addSegment,
    removeSegment,
    updateSegment
  } = useBuilderStore();
  
  const [activeTab, setActiveTab] = useState<'basic' | 'segments' | 'connections'>('basic');

  const handleStepUpdate = (field: string, value: string) => {
    updateStep(stepIndex, { [field]: value });
  };

  const handleSegmentUpdate = (segmentId: string, field: string, value: string | number) => {
    updateSegment(stepIndex, segmentId, { [field]: value });
  };

  const handleBranchesUpdate = (branches: any[]) => {
    updateStep(stepIndex, { branches });
  };

  const getRandomColor = () => {
    const colors = [
      '#4682B4', '#32CD32', '#FF6347', '#9370DB', '#FFD700',
      '#FF69B4', '#00CED1', '#FFA500', '#DC143C', '#20B2AA'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === 'basic'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Step Settings
        </button>
        <button
          onClick={() => setActiveTab('segments')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === 'segments'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Wheel Options ({step.wheelConfig?.segments?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('connections')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === 'connections'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Connections ({(step.branches || []).length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Step Title
              </label>
              <input
                type="text"
                value={step.title}
                onChange={(e) => {
                  if (e.target.value.length <= 30) {
                    handleStepUpdate('title', e.target.value);
                  }
                }}
                maxLength={30}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Enter step title..."
              />
              <p className="text-xs text-gray-500 mt-1">{step.title.length}/30 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Step Description
              </label>
              <textarea
                value={step.description}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    handleStepUpdate('description', e.target.value);
                  }
                }}
                maxLength={200}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                rows={3}
                placeholder="Describe what this step represents..."
              />
              <p className="text-xs text-gray-500 mt-1">{(step.description || '').length}/200 characters</p>
            </div>

          </div>
        )}

        {activeTab === 'segments' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Wheel Options</h4>
              <button
                onClick={() => addSegment(stepIndex)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Option</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2" style={{maxHeight: 'calc(100vh - 350px)'}}>
              {(step.wheelConfig?.segments || []).map((segment) => (
                <SegmentEditor
                  key={segment.id}
                  segment={segment}
                  onUpdate={(field, value) => handleSegmentUpdate(segment.id, field, value)}
                  onRemove={() => removeSegment(stepIndex, segment.id)}
                  canRemove={(step.wheelConfig?.segments?.length || 0) > 2}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="h-full overflow-y-auto pr-2" style={{maxHeight: 'calc(100vh - 350px)'}}>
            <BranchEditor
              stepIndex={stepIndex}
              branches={step.branches}
              onUpdate={handleBranchesUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface SegmentEditorProps {
  segment: WheelSegmentBuilder;
  onUpdate: (field: string, value: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const SegmentEditor: React.FC<SegmentEditorProps> = ({
  segment,
  onUpdate,
  onRemove,
  canRemove
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/5 rounded-xl border border-white/10">
      {/* Segment Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-6 h-6 rounded-full border-2 border-white/20"
              style={{ backgroundColor: segment.color }}
            />
            <div>
              <h5 className="font-medium text-white">{segment.text}</h5>
              <p className="text-xs text-gray-400">Weight: {segment.weight}%</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                title="Remove Option"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Option Text
              </label>
              <input
                type="text"
                value={segment.text}
                onChange={(e) => {
                  if (e.target.value.length <= 40) {
                    onUpdate('text', e.target.value);
                  }
                }}
                maxLength={40}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Enter option text..."
              />
              <p className="text-xs text-gray-500 mt-1">{segment.text.length}/40 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={segment.color}
                  onChange={(e) => onUpdate('color', e.target.value)}
                  className="w-12 h-12 bg-white/10 border border-white/20 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={segment.color}
                  onChange={(e) => onUpdate('color', e.target.value)}
                  className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="#4682B4"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Probability Weight: {segment.weight}%
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={segment.weight}
              onChange={(e) => onUpdate('weight', parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {segment.description !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={segment.description || ''}
                onChange={(e) => onUpdate('description', e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                rows={2}
                placeholder="Describe this choice..."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};