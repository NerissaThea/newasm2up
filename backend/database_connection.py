from neo4j import GraphDatabase

class Neo4jConnection:
    def __init__(self, uri, user, pwd):
        self.__uri = uri
        self.__user = user
        self.__pwd = pwd
        self.__driver = None
        try:
            self.__driver = GraphDatabase.driver(self.__uri, auth=(self.__user, self.__pwd))
            print("Connection successful")
        except Exception as e:
            print("Failed to create the driver:", e)

    def close(self):
        if self.__driver is not None:
            self.__driver.close()

    def get_neo4j_session(self):
        return self.__driver.session() if self.__driver else None

    def execute_query(self, query):
        with self.__driver.session() as session:
            result = session.run(query)
            return [record for record in result]

    def save_transaction(self, tx):
        query_create_sender = f"MERGE (s:Address {{address: '{tx['from']}'}})"
        query_create_recipient = f"MERGE (r:Address {{address: '{tx['to']}'}})"
        query_create_transaction = f"""
        CREATE (t:Transaction {{
            id: '{tx['hash']}',
            amount: {tx['value']},
            timestamp: {tx['timeStamp']}
        }})
        """
        query_create_relationship = f"""
        MATCH (s:Address {{address: '{tx['from']}'}}), (r:Address {{address: '{tx['to']}'}}), (t:Transaction {{id: '{tx['hash']}'}})
        MERGE (s)-[:SENT_TO {{amount: {tx['value']}, timestamp: {tx['timeStamp']}}}]->(t)
        MERGE (t)-[:RECEIVED_FROM {{amount: {tx['value']}, timestamp: {tx['timeStamp']}}}]->(r)
        """

        self.execute_query(query_create_sender)
        self.execute_query(query_create_recipient)
        self.execute_query(query_create_transaction)
        self.execute_query(query_create_relationship)
