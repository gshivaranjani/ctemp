import React, { Component } from 'react';
import { View, StyleSheet, Text, FlatList,TouchableOpacity } from 'react-native';
import MyHeader from '../components/MyHeader';
import firebase from 'firebase';
import db from '../config'
import { Alert } from 'react-native';
import { ListItem,Icon } from 'react-native-elements'


export default class MyDonationScreen extends Component {
    constructor(props) {
        super(props);
     //   console.log("***************************************************************************************************   "+firebase.auth().currentUser.email);
        this.state = {
            userId : firebase.auth().currentUser.email,
            donorName : "",
            allDonations : []
        }
        this.requestRef = null;
        console.log("inside my donation screen   ");
    }

    getDonorDetails=(donorId)=>{
      console.log("INSIDE GETDONOR DETAILS FUNCTION -----   "+this.state.userId);
      db.collection("users").where("username","==", this.state.userId).get()
      .then((snapshot)=>{
        snapshot.forEach((doc) => {
          console.log(doc);
          this.setState({
            "donorName" : doc.data().first_name + " " + doc.data().last_name
          })
        });
      })
      console.log("DONOR NAME:   "+this.state.donorName);
    }

    getAllDonations=()=>{
 //     console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++         "+this.state.userId);
      this.requestRef = db.collection("all_donations").where("donor_id","==",this.state.userId)
        .onSnapshot((snapshot)=>{
            var allDonations = snapshot.docs.map(document => document.data());
            this.setState({
                allDonations : allDonations,
            })
        })
    }
    componentDidMount(){
      console.log("Tryg to get all donations:  "+this.state.userId);
      this.getDonorDetails(this.state.userId)
        this.getAllDonations()
        
        console.log("Got all donations:   "+this.state.allDonations);
      }
      componentWillUnmount(){
        this.requestRef();
      }

      sendBook = (bookDetails)=>{
        if(bookDetails.request_status === "Book Sent") {
          var requestStatus = "Donor Interested"
          db.collection("all_donations").doc(bookDetails.doc_id).update({
            "request_status" : "Donor Interested"
          })
          this.sendNotification(bookDetails, requestStatus)
        } else {
          var requestStatus = "Book Sent";
          db.collection("all_donations").doc(bookDetails.doc_id).update({
            "request_status" : "Book Sent"
          })
          this.sendNotification(bookDetails,requestStatus)
        }
      }

      sendNotification = (bookDetails, requestStatus)=> {
        var requestId = bookDetails.request_id;
        var donorId = bookDetails.donor_id;
        db.collection("all_notifications")
        .where("request_id","==",requestId)
        .where("donor_id","==",donorId)
        .get()
        .then((snapshot)=>{
          snapshot.forEach((doc)=>{
            var message = "";
            if(requestStatus === "Book Sent") {
              message = this.state.donorName + " sent you book"
            } else {
              message = this.state.donorName + " has shown interest in donating the book"
            }
            db.collection("all_notifications").doc(doc.id).update({
              "message" : message,
              "notification_status" : "unread",
              "date"  : firebase.firestore.FieldValue.serverTimestamp()
            })
          })
        })
      }
      

    keyExtractor =(item,index) => index.toString()

    renderItem = ( {item, i} ) => {
    return(
     
        <ListItem
          key={i}
          title={item.book_name}
          subtitle={"Requested By : " + item.requested_by +"\nStatus : " + item.request_status}
          leftElement={<Icon name="book" type="font-awesome" color ='#696969'/>}
          titleStyle={{ color: 'black', fontWeight: 'bold' }}
          rightElement={
              <TouchableOpacity
               style={[
                 styles.button,
                 {
                   backgroundColor : item.request_status === "Book Sent" ? "green" : "#ff5722"
                 }
               ]}
               onPress = {()=>{
                 this.sendBook(item)
               }}
              >
                <Text style={{color:'#ffff'}}>
                  Send Book
                </Text>
              </TouchableOpacity>
            }
          bottomDivider
        />

       
    
       
     )
     }
    
    render() {
        return(
          
            <View style = {{flex:1}}>
             
                <MyHeader navigation={this.props.navigation} title="My Donation" />
               
               <View style = {{flex:1}}>
                
                   {  
                       this.state.allDonations.length === 0
                       ?(
                           <View style={styles.subtitle}>
                              
                               <Text style={{fontSize: 20}}>List of all Book Donations</Text>
                            </View>
                           
                       )
                       :(
                         <View>
                          
                         
                           <FlatList 
                                keyExtractor = {this.keyExtractor}
                                data = {this.state.allDonations}
                                renderItem={this.renderItem}
                           />
                           </View>
                       )
                   }
                </View> 
            </View>
        )
    }
}

const styles = StyleSheet.create({
  button:{
    width:100,
    height:30,
    justifyContent:'center',
    alignItems:'center',
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8
     },
    elevation : 16
  },
  subtitle :{
    flex:1,
    fontSize: 20,
    justifyContent:'center',
    alignItems:'center'
  }
})