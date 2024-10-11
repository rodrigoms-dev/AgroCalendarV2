/*
Dev: Rodrigo Martins
RU: 4327978
AgroCalendar V2
*/

import React, { Component } from 'react'
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
    Alert
} from 'react-native'

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';


import moment from 'moment'
import 'moment/locale/pt-br'

import commonStyles from '../commonStyles'
import bannerImage from '../../assets/imgs/banner.jpg'
import Task from '../components/Task'
import AddTask from './AddTask'

const initialState = {
    showDoneTasks: true,
    showAddTask: false,
    visibleTasks: [],
    tasks: []
}

export default class TaskList extends Component {
    state = {
        ...initialState
    }

    componentDidMount = async () => {
        const stateString = await AsyncStorage.getItem('tasksState')
        const state = JSON.parse(stateString) || initialState
        this.setState(state, this.filterTasks)
    }

    toggleFilter = () => {
        this.setState({ showDoneTasks: !this.state.showDoneTasks }, this.filterTasks)
    }

    // Filtragem das tarefas
    filterTasks = () => {
        let visibleTasks = null
        if(this.state.showDoneTasks) {
            visibleTasks = [...this.state.tasks] // Exibe todas
        } else {
            const pending = task => task.doneAt === null // Exibe apenas as não concluidas
            visibleTasks = this.state.tasks.filter(pending)
        }

        this.setState({ visibleTasks })
        AsyncStorage.setItem('tasksState', JSON.stringify(this.state))
    }
    // Status tarefa
    toggleTask = taskId => {
        const tasks = [...this.state.tasks]
        tasks.forEach(task => {
            if(task.id === taskId) {
                task.doneAt = task.doneAt ? null : new Date()
            }
        })

        this.setState({ tasks }, this.filterTasks)
    }
    // Adicionar tarefa
    addTask = newTask => {
        if(!newTask.desc || !newTask.desc.trim()) {
            Alert.alert('Dados Inválidos', 'Descrição não informada!')
            return 
        }

        const tasks = [...this.state.tasks]
        tasks.push({
            id: Math.random(),
            desc: newTask.desc,
            estimateAt: newTask.date,
            doneAt: null
        })

        this.setState({ tasks, showAddTask: false }, this.filterTasks)
    }
    // Excluir tarefa da lista
    deleteTask = id => {
        const tasks = this.state.tasks.filter(task => task.id !== id)
        this.setState({ tasks }, this.filterTasks)
    }

    render() {
        // Formata a data para exibição
        const today = moment().locale('pt-br').format('ddd, D [de] MMMM');
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <AddTask 
                        isVisible={this.state.showAddTask}
                        onCancel={() => this.setState({ showAddTask: false })}
                        onSave={this.addTask} 
                    />
                    {/* Banner de fundo */}
                    <ImageBackground source={bannerImage} style={styles.background}>
                        <View style={styles.iconBar}>
                            {/* Botão para ocultar tarefas concluidas*/}
                            <TouchableOpacity onPress={this.toggleFilter}>
                                <Icon name={this.state.showDoneTasks ? 'eye' : 'eye-slash'} size={20} color='#000' />
                            </TouchableOpacity>
                        </View>
                        {/* Data de Hoje */}
                        <View style={styles.titleBar}>
                            <Text style={styles.title}>Hoje</Text>
                            <Text style={styles.subtitle}>{today}</Text>
                        </View>
                    </ImageBackground>
                    <View style={styles.taskList}>
                        <FlatList 
                            data={this.state.visibleTasks}
                            keyExtractor={item => `${item.id}`}
                            renderItem={({item}) => (
                                <Task {...item} onToggleTask={this.toggleTask} onDelete={this.deleteTask} />
                            )} 
                        />
                    </View>
                    <TouchableOpacity style={styles.addButton} 
                        activeOpacity={0.7}
                        onPress={() => this.setState({ showAddTask: true })}>
                        <Icon name="plus" size={20} color={commonStyles.colors.secondary} />
                    </TouchableOpacity>
                </View>
            </GestureHandlerRootView>
        );
    }
    
}

// Estilização da página
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 3
    },
    taskList: {
        flex: 7,
        backgroundColor: commonStyles.colors.background
    },
    titleBar: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    title: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 50,
        marginLeft: 20,
        marginBottom: 20
    },
    subtitle: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 20,
        marginLeft: 20,
        marginBottom: 30
    },
    iconBar: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'flex-end',
        marginTop: 10
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: commonStyles.colors.today,
        justifyContent: 'center',
        alignItems: 'center'
    }
});