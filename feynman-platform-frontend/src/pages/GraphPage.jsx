import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import apiClient from '../api/axios';

function GraphPage() {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                const response = await apiClient.get('/graph/knowledge-map');
                setGraphData(response.data);
            } catch (err) {
                console.error('获取知识图谱失败:', err);
                setError(err.response?.data?.msg || '无法加载知识图谱，请稍后再试。');
            } finally {
                setLoading(false);
            }
        };

        fetchGraph();
    }, []);

    const chartOption = useMemo(() => {
        if (!graphData.nodes?.length) {
            return {};
        }

        const statusColorMap = {
            mastered: '#2ecc71',
            reviewing: '#f39c12',
            draft: '#3498db',
        };

        const nodesWithStyle = graphData.nodes.map((node) => ({
            ...node,
            itemStyle: {
                color: statusColorMap[node.status] || (node.reviewList ? '#f39c12' : '#3498db'),
            },
        }));

        return {
            tooltip: {
                formatter: (params) => {
                    if (params.dataType === 'node') {
                        return `<strong>${params.data.name}</strong><br/>${params.data.value || ''}`;
                    }
                    return '';
                },
            },
            series: [
                {
                    type: 'graph',
                    layout: 'force',
                    data: nodesWithStyle,
                    links: graphData.links,
                    roam: true,
                    label: {
                        show: true,
                        position: 'right',
                        formatter: '{b}',
                    },
                    lineStyle: {
                        color: '#aaa',
                        opacity: 0.6,
                    },
                    force: {
                        repulsion: 200,
                        edgeLength: [50, 150],
                    },
                    emphasis: {
                        focus: 'adjacency',
                        lineStyle: {
                            width: 3,
                        },
                    },
                },
            ],
        };
    }, [graphData]);

    const onChartClick = (params) => {
        if (params.componentType === 'series' && params.dataType === 'node') {
            navigate(`/kp/edit/${params.data.id}`);
        }
    };

    if (loading) {
        return <p>正在生成知识图谱...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (!graphData.nodes?.length) {
        return (
            <div>
                <h1 className="text-2xl font-semibold mb-4">知识图谱</h1>
                <p>当前还没有知识点，先去创建一些吧！</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-2">知识图谱</h1>
            <p className="text-gray-600 mb-6">展示知识点之间的引用关系。点击节点可跳转编辑。</p>
            <ReactECharts
                option={chartOption}
                style={{ height: '600px', width: '100%' }}
                onEvents={{ click: onChartClick }}
            />
        </div>
    );
}

export default GraphPage;

