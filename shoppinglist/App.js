import * as sqlite from "expo-sqlite";
import { Button, FlatList, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { useState, useEffect } from "react";


export default function App() {
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [shoppingList, setShoppingList] = useState([]);

  const db = sqlite.openDatabase("shopping.db");

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists shoppinglist (id integer primary key not null, product text, amount text);');
    }, () => showError("Error while creating table"), updateList);
  }, []);

  const showError = (message) => {
    Alert.alert(message);
  }

  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('select * from shoppinglist;', [], (_, { rows }) =>
        setShoppingList(rows._array)
      );
    }, () => showError("Error while updating"), null);
  }

  const saveItem = () => {
    db.transaction(tx => {
      tx.executeSql('insert into shoppinglist (product, amount) values (?, ?);', 
        [product, amount]);
    }, () => showError("Error while saving"), updateList)
  }

  const deleteItem = (id) => {
    db.transaction(tx => {
      tx.executeSql('delete from shoppinglist where id = ?;', 
        [id]);
    }, () => showError("Error while deleting"), updateList)
  }

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input}
        placeholder="Product"
        value={product}
        onChangeText={product => setProduct(product)}
      />
      <TextInput 
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={amount => setAmount(amount)}
      />
      <Button 
        title="save"
        onPress={saveItem}
      />
      <FlatList
        style={styles.listContainer}
        keyExtractor={item => item.id.toString()}
        data={shoppingList}
        renderItem={({item}) => 
          <View style={styles.list}>
            <Text>{item.product}, {item.amount}</Text>
            <Text
              style={{color: '#0000ff'}}
              onPress={() => deleteItem(item.id)}
            >
              bought
            </Text>
          </View>
        }    
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40
  },
  input: {
    width: 200,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 2
  },
  listContainer: {
    margin: 10
  },
  list: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
  }
});
