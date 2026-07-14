/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { BaseEntity, PageBlock } from '../domain/service.types';
import { BlockRenderer } from './BlockRenderer';
import { layoutPresets } from '../config/layoutPresets';

interface LayoutEngineProps<T extends BaseEntity> {
  entity: T;
}

export const LayoutEngine = <T extends BaseEntity>({ entity }: LayoutEngineProps<T>) => {
  // Determine blocks to render: preset first, then fallback to pageBlocks if it exists
  let blocks: PageBlock[] = [];
  
  const entityRecord = entity as unknown as Record<string, unknown>;
  if (Array.isArray(entityRecord.pageBlocks)) {
    blocks = entityRecord.pageBlocks as PageBlock[];
  }
  
  if (entity.layoutPreset && layoutPresets[entity.layoutPreset]) {
    blocks = layoutPresets[entity.layoutPreset] ?? blocks;
  }

  if (!blocks || blocks.length === 0) {
    return null;
  }

  // Pre-render validation: Filter out invalid blocks and handle duplicate IDs safely
  const validBlocks = blocks.filter((block) => {
    const isEnabled = (block as unknown as Record<string, unknown>).enabled !== false;
    return block.id && isEnabled;
  });
  
  const uniqueBlocksMap = new Map<string, PageBlock>();
  validBlocks.forEach((block) => {
    uniqueBlocksMap.set(block.id, block);
  });
  const uniqueBlocks = Array.from(uniqueBlocksMap.values());

  // Sort blocks by order if provided
  const sortedBlocks = uniqueBlocks.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  return (
    <div className="flex flex-col">
      {sortedBlocks.map((block) => (
        <div key={block.id} className="w-full relative group/section">
          {/* Analytics tracking wrapper can be injected here based on block.analytics */}
          <BlockRenderer 
            entity={entity} 
            block={block} 
          />
        </div>
      ))}
    </div>
  );
};
