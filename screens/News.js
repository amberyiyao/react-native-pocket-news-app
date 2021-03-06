import React, {useState, useEffect} from "react"
import { View, ScrollView, Image, Text, Dimensions,AsyncStorage, TouchableWithoutFeedback, RefreshControl } from "react-native"
import {Button} from "native-base"
import { Icon } from 'react-native-elements'

export default function News(props) {

    const [isSaved, setIsSaved] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [savedList, setSavedList] = useState([])


    const article = props.route.params
    const deviceWidth = Dimensions.get('window').width
    const content =article.content? article.content.split('…') : ["Can not get content, press Read All Article to read.",""]
    const imagePlaceholder = 'https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png'
    const recentViewKey = 'recentViewKey'
    const savedNewsKey = 'savedNewsKey'

    useEffect(()=>{
        (async () => {
            try {
                const value = await AsyncStorage.getItem(savedNewsKey);
                if(value !== null) {
                   const saved = JSON.parse(value).findIndex(item => item.content == article.content)
                   setSavedList(JSON.parse(value))
                   setIsSaved(saved != -1 ? true : false)
                }
            } catch (error) {
                console.log(error)
            }
        })()
    }, [])

    const getRecentList = async () => {
        try {
            const value = await AsyncStorage.getItem(recentViewKey);
            if (value !== null) {
                const newValue = JSON.parse(value).filter(item => item.content != article.content)
                saveRecentList([article, ...newValue].slice(0,20))
            } else {
                saveRecentList([])
            }
        } catch (error) {
            console.log(error)
        }
    }

    const saveRecentList = async (list) => {
        try{
            await AsyncStorage.setItem(recentViewKey, JSON.stringify(list))
        }catch(err){
            console.log(err)
        }
    }

    toggleSaveNews = async () => {
        setIsLoading(true)
        if(isSaved){
            const newSavedList = savedList.filter(item => item.content != article.content)
            setSavedList(newSavedList)
            try{
                await AsyncStorage.setItem(savedNewsKey, JSON.stringify(newSavedList))
            }catch(err){
                console.log(err)
            }
            setIsLoading(false)
            setIsSaved(false)
            
        } else {
            const newSavedList = [article, ...savedList]
            setSavedList(newSavedList)
            try{
                await AsyncStorage.setItem(savedNewsKey, JSON.stringify(newSavedList))
            }catch(err){
                console.log(err)
            }
            setIsLoading(false)
            setIsSaved(true)
        }
    }
    
    return(
        <ScrollView
        refreshControl={ 
            <RefreshControl refreshing={isLoading} onRefresh={toggleSaveNews} title={isSaved? "Unsaving..." : "Saving..."} />
          }>
            <View style={{alignItems:'center'}}>
                <View style={{alignItems:'center'}}>
                    <View style={{backgroundColor:'#000', height:250, width: deviceWidth, opacity: 0.2, position:'absolute'}}></View>

                    <Image style={{height:250, width: deviceWidth, zIndex:-1}} resizeMode="cover"
                    source={{uri: article.urlToImage ? article.urlToImage : imagePlaceholder }}/>

                    <TouchableWithoutFeedback onPress={toggleSaveNews}>
                        <View style={{position:'absolute', right:deviceWidth*0.05, top:-8}}>
                            <Icon name={isSaved ?'bookmark' : "bookmark-outline"} size={35} color={isSaved? "#3196e2":'white'} type='material-community'/>
                        </View>
                    </TouchableWithoutFeedback>

                    <View style={{position:'relative', bottom: 50, backgroundColor:'white', width: deviceWidth * 0.9, paddingVertical: 18, paddingBottom:23, paddingHorizontal:24, shadowColor: '#000', shadowOpacity: 0.07, shadowOffset: {width:3,height:0}, shadowRadius: 10, borderRadius:4}}>
                        <Text style={{fontWeight:'600', fontSize:24, marginBottom: 18, lineHeight:34, fontWeight:'300'}}>{article.title}</Text>
                        <View style={{flexDirection:'row',alignSelf:'flex-end', justifyContent:'space-between',width:'100%', borderBottomColor: '#ddd', borderBottomWidth:1, paddingBottom: 18}}>
                            <Text style={{fontSize:12, color:'#3196e2', fontWeight:'300'}}>{article.source.name}</Text>
                            <Text style={{color:'#aaa', fontSize:12, fontWeight:'300'}}>{article.publishedAt}</Text>
                        </View>
                        <Text style={{marginTop: 18, lineHeight:24, fontWeight:'300'}}>{content[0]}... <Text style={{color:'#aaa'}}>{content[1]}</Text></Text>
                    </View>
                </View>
                <Button dark style={{width:deviceWidth*0.9, height: 40, alignItems:'center',justifyContent:'center', position:'relative', bottom: 28}} 
                    onPress={()=>{
                        props.navigation.navigate('News Website', article.url)
                        getRecentList()
                    }}><Text style={{color:'white', fontSize:15}}> Read All Article </Text></Button>
            </View>
        </ScrollView>
        )
}