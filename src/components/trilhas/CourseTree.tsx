'use client';

import React, { useMemo, useCallback } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Position,
    MarkerType,
    Node,
    Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Trail } from '@/types';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface CourseTreeProps {
    trails: Trail[];
    completedIds: string[];
    cursandoIds: string[];
}

const nodeWidth = 200;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 40 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = direction === 'LR' ? Position.Left : Position.Top;
        node.sourcePosition = direction === 'LR' ? Position.Right : Position.Bottom;

        // We are shifting the dagre node position (which is center) to top-left for React Flow
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
    });

    return { nodes, edges };
};

const CourseNode = ({ data }: { data: any }) => {
    const { trail, status } = data;
    const isCompleted = status === 'completed';
    const isCursando = status === 'cursando';

    return (
        <div className={`
            p-4 rounded-xl border-2 transition-all w-[200px] h-[80px] flex flex-col justify-between
            ${isCompleted ? 'bg-green-500/10 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 
              isCursando ? 'bg-brand-red/10 border-brand-red animate-pulse' : 
              'bg-[#1e1e1e] border-white/10 text-gray-400'}
        `}>
            <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-mono font-black opacity-60 uppercase">{trail.course_code}</span>
                {isCompleted ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : 
                 isCursando ? <Clock className="w-4 h-4 text-brand-red" /> : 
                 <Circle className="w-4 h-4 opacity-20" />}
            </div>
            <div className={`text-xs font-bold leading-tight line-clamp-2 ${isCompleted || isCursando ? 'text-white' : ''}`}>
                {trail.title}
            </div>
        </div>
    );
};

const nodeTypes = {
    course: CourseNode,
};

export function CourseTree({ trails, completedIds, cursandoIds }: CourseTreeProps) {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodes: Node[] = trails.map(trail => ({
            id: trail.id,
            type: 'course',
            data: { 
                trail, 
                status: completedIds.includes(trail.id) ? 'completed' : 
                        cursandoIds.includes(trail.id) ? 'cursando' : 'none'
            },
            position: { x: 0, y: 0 },
        }));

        const edges: Edge[] = [];
        trails.forEach(trail => {
            if (trail.prerequisites && trail.prerequisites.length > 0) {
                trail.prerequisites.forEach(prereqCode => {
                    const prereqTrail = trails.find(t => t.course_code === prereqCode);
                    if (prereqTrail) {
                        edges.push({
                            id: `e-${prereqTrail.id}-${trail.id}`,
                            source: prereqTrail.id,
                            target: trail.id,
                            animated: cursandoIds.includes(trail.id),
                            style: { strokeWidth: 2, stroke: completedIds.includes(prereqTrail.id) ? '#22c55e' : '#333' },
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: completedIds.includes(prereqTrail.id) ? '#22c55e' : '#333',
                            },
                        });
                    }
                });
            }
        });

        return getLayoutedElements(nodes, edges);
    }, [trails, completedIds, cursandoIds]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Sync state when props change
    React.useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

    return (
        <div className="w-full h-[600px] bg-[#121212] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.2}
                maxZoom={1.5}
            >
                <Background color="#333" gap={20} />
                <Controls className="bg-[#1e1e1e] border-white/10 text-white fill-white" />
            </ReactFlow>
        </div>
    );
}
