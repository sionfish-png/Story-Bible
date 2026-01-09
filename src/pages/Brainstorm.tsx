import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
} from 'reactflow';
import type { Node, Edge, Connection, NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import { useBook } from '../BookContext';
import type { BrainstormNode as DBNode, BrainstormConnection } from '../types';
import {
  getBrainstormNodesByBook,
  saveBrainstormNode,
  deleteBrainstormNode,
  getBrainstormConnectionsByBook,
  saveBrainstormConnection,
  deleteBrainstormConnection,
  generateId,
} from '../db';
import { StickyNote, Image as ImageIcon, Trash2 } from 'lucide-react';

// Custom Node Component
function NoteNode({ data }: { data: any }) {
  return (
    <div
      className="px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] max-w-[300px]"
      style={{
        backgroundColor: data.color || '#FEF3C7',
        borderColor: data.color ? data.color : '#FCD34D',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <StickyNote className="w-4 h-4 text-gray-600" />
        {data.onDelete && (
          <button
            onClick={() => data.onDelete(data.id)}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => data.onChange && data.onChange(data.id, e.currentTarget.textContent || '')}
        className="text-sm text-gray-800 outline-none whitespace-pre-wrap break-words"
      >
        {data.content}
      </div>
    </div>
  );
}

function ImageNode({ data }: { data: any }) {
  return (
    <div className="shadow-lg rounded-lg border-2 border-gray-300 bg-white overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200">
        <ImageIcon className="w-4 h-4 text-gray-600" />
        {data.onDelete && (
          <button
            onClick={() => data.onDelete(data.id)}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <img src={data.content} alt="Brainstorm" className="max-w-[300px] max-h-[300px] object-contain" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  note: NoteNode,
  image: ImageNode,
};

const colors = ['#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3', '#E0E7FF', '#FED7AA'];

export default function Brainstorm() {
  const { currentBook } = useBook();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  useEffect(() => {
    if (currentBook) {
      loadBrainstormData();
    }
  }, [currentBook]);

  async function loadBrainstormData() {
    if (!currentBook) return;

    const dbNodes = await getBrainstormNodesByBook(currentBook.id);
    const dbConnections = await getBrainstormConnectionsByBook(currentBook.id);

    // Convert DB nodes to ReactFlow nodes
    const flowNodes: Node[] = dbNodes.map(node => ({
      id: node.id,
      type: node.type === 'note' ? 'note' : 'image',
      position: node.position,
      data: {
        id: node.id,
        content: node.content,
        color: node.color,
        onChange: handleNodeContentChange,
        onDelete: handleDeleteNode,
      },
    }));

    // Convert DB connections to ReactFlow edges
    const flowEdges: Edge[] = dbConnections.map(conn => ({
      id: conn.id,
      source: conn.fromNodeId,
      target: conn.toNodeId,
      label: conn.label,
      type: 'default',
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }

  async function handleNodeContentChange(nodeId: string, newContent: string) {
    if (!currentBook) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const dbNode: DBNode = {
      id: nodeId,
      bookId: currentBook.id,
      type: node.type === 'image' ? 'image' : 'note',
      content: newContent,
      position: node.position,
      color: node.data.color,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await saveBrainstormNode(dbNode);
  }

  async function handleDeleteNode(nodeId: string) {
    await deleteBrainstormNode(nodeId);
    setNodes(nodes.filter(n => n.id !== nodeId));
    setEdges(edges.filter(e => e.source !== nodeId && e.target !== nodeId));
  }

  async function handleAddNote() {
    if (!currentBook) return;

    const id = generateId();
    const newNode: DBNode = {
      id,
      bookId: currentBook.id,
      type: 'note',
      content: 'New note...',
      position: { x: Math.random() * 500 + 100, y: Math.random() * 300 + 100 },
      color: selectedColor,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await saveBrainstormNode(newNode);

    const flowNode: Node = {
      id,
      type: 'note',
      position: newNode.position,
      data: {
        id,
        content: newNode.content,
        color: newNode.color,
        onChange: handleNodeContentChange,
        onDelete: handleDeleteNode,
      },
    };

    setNodes([...nodes, flowNode]);
  }

  async function handleAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (!currentBook || !e.target.files) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const id = generateId();

      const newNode: DBNode = {
        id,
        bookId: currentBook.id,
        type: 'image',
        content: base64,
        position: { x: Math.random() * 500 + 100, y: Math.random() * 300 + 100 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await saveBrainstormNode(newNode);

      const flowNode: Node = {
        id,
        type: 'image',
        position: newNode.position,
        data: {
          id,
          content: newNode.content,
          onDelete: handleDeleteNode,
        },
      };

      setNodes([...nodes, flowNode]);
    };

    reader.readAsDataURL(file);
  }

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!currentBook || !params.source || !params.target) return;

      const id = generateId();
      const newConnection: BrainstormConnection = {
        id,
        bookId: currentBook.id,
        fromNodeId: params.source,
        toNodeId: params.target,
      };

      await saveBrainstormConnection(newConnection);

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id,
            type: 'default',
          },
          eds
        )
      );
    },
    [currentBook, setEdges]
  );

  const onEdgeDelete = useCallback(
    async (edgesToDelete: Edge[]) => {
      for (const edge of edgesToDelete) {
        await deleteBrainstormConnection(edge.id);
      }
    },
    []
  );

  const onNodeDragStop = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      if (!currentBook) return;

      const dbNode = await getBrainstormNodesByBook(currentBook.id);
      const existingNode = dbNode.find(n => n.id === node.id);

      if (existingNode) {
        existingNode.position = node.position;
        existingNode.updatedAt = new Date();
        await saveBrainstormNode(existingNode);
      }
    },
    [currentBook]
  );

  if (!currentBook) {
    return <div className="p-8">Please select a book first.</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Brainstorm Board</h2>

        <div className="flex items-center space-x-4">
          {/* Color Picker */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Note Color:</span>
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded border-2 ${
                  selectedColor === color ? 'border-gray-800' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Add Buttons */}
          <button
            onClick={handleAddNote}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <StickyNote className="w-4 h-4 mr-2" />
            Add Note
          </button>

          <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
            <ImageIcon className="w-4 h-4 mr-2" />
            Add Image
            <input type="file" accept="image/*" onChange={handleAddImage} className="hidden" />
          </label>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onEdgesDelete={onEdgeDelete}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Instructions */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <StickyNote className="w-24 h-24 mx-auto mb-4 opacity-20" />
            <p className="text-lg mb-2">Start brainstorming!</p>
            <p className="text-sm">Add notes and images, then drag to connect them</p>
          </div>
        </div>
      )}
    </div>
  );
}
