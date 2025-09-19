import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UploadedFile, FieldMapping } from '@/types';

interface FieldMapperProps {
  file: UploadedFile;
  onAutoMap: () => void;
  onUpdateMappings: (mappings: FieldMapping[]) => void;
}

const FieldMapper = ({ file, onAutoMap, onUpdateMappings }: FieldMapperProps) => {
  const [isAutoMapping, setIsAutoMapping] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<FieldMapping | null>(null);

  const handleAutoMap = async () => {
    setIsAutoMapping(true);
    await onAutoMap();
    setIsAutoMapping(false);
  };

  const handleAddMapping = () => {
    const newMapping: FieldMapping = {
      id: `mapping-${Date.now()}`,
      label: 'New Field',
      bbox: [100, 100, 200, 50],
      confidence: 0.5,
    };
    
    onUpdateMappings([...file.mappings, newMapping]);
  };

  const handleUpdateMapping = (mappingId: string, updates: Partial<FieldMapping>) => {
    const updatedMappings = file.mappings.map(mapping =>
      mapping.id === mappingId ? { ...mapping, ...updates } : mapping
    );
    onUpdateMappings(updatedMappings);
  };

  const handleRemoveMapping = (mappingId: string) => {
    const filteredMappings = file.mappings.filter(mapping => mapping.id !== mappingId);
    onUpdateMappings(filteredMappings);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge className="confidence-high">High ({Math.round(confidence * 100)}%)</Badge>;
    } else if (confidence >= 0.6) {
      return <Badge className="confidence-medium">Medium ({Math.round(confidence * 100)}%)</Badge>;
    } else {
      return <Badge className="confidence-low">Low ({Math.round(confidence * 100)}%)</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* File Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon.Document className="h-6 w-6 text-gray-500" />
          <div>
            <h3 className="font-semibold">{file.file.name}</h3>
            <p className="text-sm text-muted-foreground">
              {file.pageCount} pages • {file.mappings.length} mappings
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleAutoMap}
          disabled={isAutoMapping}
          className="btn-secondary"
        >
          {isAutoMapping ? (
            <>
              <div className="animate-pulse-subtle mr-2 h-4 w-4 rounded-full bg-current" />
              Auto-mapping...
            </>
          ) : (
            <>
              <Icon.Settings className="mr-2 h-4 w-4" />
              Auto-map using AI
            </>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Preview Area */}
        <div className="space-y-4">
          <h4 className="font-medium">Document Preview</h4>
          <Card className="p-4">
            <div className="relative bg-gray-100 rounded aspect-[3/4] min-h-[400px] flex items-center justify-center">
              {/* Mock document preview with overlay rectangles */}
              <div className="absolute inset-4 bg-white rounded shadow-sm">
                <div className="p-4">
                  <div className="text-sm text-gray-400 mb-4">Sample Exam Paper</div>
                  
                  {/* Simulated form fields with bounding boxes */}
                  {file.mappings.map((mapping, index) => (
                    <div
                      key={mapping.id}
                      className={`
                        absolute border-2 cursor-pointer transition-all
                        ${selectedMapping?.id === mapping.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-400 hover:border-gray-600'
                        }
                      `}
                      style={{
                        left: `${(mapping.bbox[0] / 600) * 100}%`,
                        top: `${(mapping.bbox[1] / 800) * 100}%`,
                        width: `${(mapping.bbox[2] / 600) * 100}%`,
                        height: `${(mapping.bbox[3] / 800) * 100}%`,
                      }}
                      onClick={() => setSelectedMapping(mapping)}
                    >
                      <div className="absolute -top-6 left-0 text-xs font-medium bg-white px-1 rounded">
                        {mapping.label}
                      </div>
                      <div className="absolute -bottom-6 right-0">
                        {getConfidenceBadge(mapping.confidence)}
                      </div>
                    </div>
                  ))}
                  
                  {/* Mock content */}
                  <div className="space-y-8 mt-8">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Student ID: ________________</div>
                      <div className="h-8 border-b border-gray-300"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-sm font-medium">Question 1: Answer Area</div>
                      <div className="h-24 border border-gray-300 rounded"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-sm font-medium">Question 2: Answer Area</div>
                      <div className="h-32 border border-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <div>💡 Tip: Click bounding boxes to edit field mappings</div>
              <div>Confidence scores show AI detection reliability</div>
            </div>
          </Card>
        </div>

        {/* Field Mappings Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Field Mappings</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddMapping}
              className="btn-tertiary"
            >
              <Icon.Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </div>

          {file.mappings.length === 0 ? (
            <Card className="p-6 text-center">
              <Icon.Settings className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-medium mb-2">No mappings detected</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Use AI auto-mapping or manually add field mappings
              </p>
              <Button onClick={handleAutoMap} className="btn-secondary">
                Auto-map using AI
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {file.mappings.map((mapping, index) => (
                <motion.div
                  key={mapping.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card className={`
                    p-4 transition-all cursor-pointer
                    ${selectedMapping?.id === mapping.id ? 'ring-2 ring-primary' : 'hover:bg-gray-50'}
                  `}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`label-${mapping.id}`} className="text-sm font-medium">
                          Field Label
                        </Label>
                        {getConfidenceBadge(mapping.confidence)}
                      </div>
                      
                      <Input
                        id={`label-${mapping.id}`}
                        value={mapping.label}
                        onChange={(e) => handleUpdateMapping(mapping.id, { label: e.target.value })}
                        className="text-sm"
                      />

                      {mapping.ocrText && (
                        <div>
                          <Label className="text-sm font-medium">Detected Text</Label>
                          <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                            "{mapping.ocrText}"
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <Label className="text-xs">X</Label>
                          <Input
                            type="number"
                            value={mapping.bbox[0]}
                            onChange={(e) => handleUpdateMapping(mapping.id, {
                              bbox: [parseInt(e.target.value), mapping.bbox[1], mapping.bbox[2], mapping.bbox[3]]
                            })}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Y</Label>
                          <Input
                            type="number"
                            value={mapping.bbox[1]}
                            onChange={(e) => handleUpdateMapping(mapping.id, {
                              bbox: [mapping.bbox[0], parseInt(e.target.value), mapping.bbox[2], mapping.bbox[3]]
                            })}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">W</Label>
                          <Input
                            type="number"
                            value={mapping.bbox[2]}
                            onChange={(e) => handleUpdateMapping(mapping.id, {
                              bbox: [mapping.bbox[0], mapping.bbox[1], parseInt(e.target.value), mapping.bbox[3]]
                            })}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">H</Label>
                          <Input
                            type="number"
                            value={mapping.bbox[3]}
                            onChange={(e) => handleUpdateMapping(mapping.id, {
                              bbox: [mapping.bbox[0], mapping.bbox[1], mapping.bbox[2], parseInt(e.target.value)]
                            })}
                            className="text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMapping(mapping.id)}
                          className="btn-tertiary text-destructive hover:text-destructive"
                        >
                          <Icon.X className="mr-1 h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Mapping Instructions */}
          <Card className="p-4 bg-gray-50">
            <h5 className="font-medium mb-2">Mapping Instructions</h5>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Auto-map detects Student ID and answer regions</div>
              <div>• Review confidence scores - adjust low-confidence mappings</div>
              <div>• Use keyboard arrows to fine-tune bounding boxes</div>
              <div>• Ensure all required fields are mapped before proceeding</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FieldMapper;