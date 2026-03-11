<template>
    <div class="specs-table" :ref="setTableRef">
        <div class="table-header">
            <div class="table-cell">技术参数</div>
            <div class="table-cell">额定规格</div>
            <div class="table-cell">备注</div>
        </div>
        <div
            class="table-row"
            v-for="(spec, index) in specifications"
            :key="index"
            :ref="setRowRef(index)"
        >
            <div class="table-cell">{{ spec.parameter }}</div>
            <div class="table-cell">
                {{ spec.specification }}
            </div>
            <div class="table-cell">{{ spec.remark }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    specifications: {
        type: Array,
        required: true
    },
    tableId: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['table-mounted', 'row-mounted'])

const tableRef = ref(null)
const rowRefs = ref([])

const setTableRef = (el) => {
    tableRef.value = el
    emit('table-mounted', el, props.tableId)
}

const setRowRef = (index) => (el) => {
    if (el) {
        rowRefs.value[index] = el
        emit('row-mounted', el, index, props.tableId)
    }
}
</script>

<style scoped>
.specs-table {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;
}

.table-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
}

.table-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s ease;
}

.table-row:hover {
    background-color: #f8f9fa;
}

.table-row:last-child {
    border-bottom: none;
}

.table-cell {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    min-height: 60px;
}

.table-header .table-cell {
    padding: 20px;
    font-size: 1.1rem;
}

.table-row:nth-child(even) {
    background-color: #fafafa;
}

.table-row:nth-child(even):hover {
    background-color: #f1f3f4;
}

@media (max-width: 768px) {
    .table-header,
    .table-row {
        grid-template-columns: 1fr;
        gap: 10px;
    }
    
    .table-cell {
        padding: 12px 16px;
        min-height: auto;
    }
    
    .table-header .table-cell {
        padding: 16px;
        font-size: 1rem;
    }
}
</style>